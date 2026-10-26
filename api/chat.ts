import { buildSystemPrompt } from "../src/utils/systemPrompt";

/**
 * Serverless proxy to Groq for the /play chat assistant.
 *
 * The key never reaches the browser, and neither does the grounding prompt —
 * this function builds it (see src/utils/systemPrompt.ts) and prepends it to
 * whatever the visitor sent. That is deliberate on two counts:
 *
 *  - The prompt is ~11,400 characters, well past MAX_CHARS_PER_MESSAGE. When
 *    the client sent it, every request failed the length check with HTTP 400
 *    and the assistant answered nothing at all. The caps below exist to bound
 *    VISITOR input, so the prompt is added after they are applied.
 *  - `system` is no longer an accepted role on the way in. While it was, this
 *    endpoint would forward any system prompt a caller supplied, which made it
 *    a free general-purpose language model billed to the owner's Groq account.
 *    Now the only thing a caller can control is the conversation.
 *
 * Still unauthenticated, so anyone can spend tokens here by talking to the
 * assistant. The caps bound one request; they do not stop a determined abuser.
 * A rate limit in front of it is the fix if that ever matters.
 */

const MODEL = "llama-3.3-70b-versatile";
const MAX_MESSAGES = 24;
const MAX_CHARS_PER_MESSAGE = 6000;
const MAX_TOTAL_CHARS = 24000;
const ALLOWED_ROLES = new Set(["user", "assistant"]);

/* Structural types only. @vercel/node is not a dependency of this project and
   pulling it in for two field accesses is not worth the install. */
interface ChatRequest {
  method?: string;
  body?: { messages?: unknown };
}

interface ChatResponse {
  status(code: number): ChatResponse;
  json(body: unknown): unknown;
  setHeader(name: string, value: string): unknown;
}

export default async function handler(req: ChatRequest, res: ChatResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;

  /* 503, not 500: the code is fine, the deployment just has no key. The
     client shows this string, so it has to make sense to a visitor. */
  if (!apiKey) {
    return res.status(503).json({
      error: "the chat assistant is not configured on this deployment",
    });
  }

  const messages = req.body?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array" });
  }

  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: "conversation too long" });
  }

  let totalChars = 0;
  const conversation: { role: string; content: string }[] = [];

  for (const message of messages) {
    if (
      !message ||
      typeof message.content !== "string" ||
      !ALLOWED_ROLES.has(message.role)
    ) {
      return res.status(400).json({ error: "malformed message in conversation" });
    }
    if (message.content.length > MAX_CHARS_PER_MESSAGE) {
      return res.status(400).json({ error: "message too long" });
    }
    totalChars += message.content.length;
    conversation.push({ role: message.role, content: message.content });
  }

  if (totalChars > MAX_TOTAL_CHARS) {
    return res.status(400).json({ error: "conversation too long" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...conversation,
        ],
        model: MODEL,
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    /* Groq's success body is passed through to the client untouched, so it is
       typed only as far as the one field this function reads. */
    const data = (await response.json()) as {
      error?: { message?: string };
      [key: string]: unknown;
    };

    if (!response.ok) {
      /* Pass the upstream status through so a rate limit reads as a rate
         limit instead of a generic server error. */
      const status =
        response.status >= 400 && response.status < 600 ? response.status : 502;
      return res.status(status).json({
        error: data?.error?.message || "the language model refused the request",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Groq API error:", error);
    return res.status(502).json({ error: "could not reach the language model" });
  }
}
