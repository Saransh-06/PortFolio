import { useEffect } from "react";

/**
 * Per-route <title> and meta description.
 *
 * This is a single-page app: one index.html serves /, /myworks and /play, so
 * the build-time tags in vite.config.ts are necessarily identical on all three.
 * That left every route sharing one title — wrong in the tab strip, wrong in
 * browser history, wrong in a bookmark, and wrong for any crawler that renders
 * JS (which the major ones now do).
 *
 * Only title and description are touched. The og:/twitter: tags are read by
 * scrapers that famously do *not* run JS, so rewriting those client-side would
 * look correct in the DOM inspector and change nothing about a shared link —
 * honest per-route social cards would need prerendering, not this hook.
 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const tag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    const previousDescription = tag?.content;
    if (tag && description) tag.content = description;

    /* Restored on unmount so a route that does not call this hook cannot
       inherit the last one's title. */
    return () => {
      document.title = previousTitle;
      if (tag && previousDescription !== undefined) {
        tag.content = previousDescription;
      }
    };
  }, [title, description]);
}
