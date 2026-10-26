import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { config as site } from "./src/config";

/**
 * The head tags are generated from src/config.ts at build time so the title,
 * meta description, social cards and JSON-LD can't drift from the data the
 * page itself renders. index.html keeps a hand-written <title> as a fallback;
 * this plugin rewrites it.
 *
 * The canonical origin comes from the environment, not a hardcoded domain:
 * Vercel exposes VERCEL_PROJECT_PRODUCTION_URL on every build, and SITE_URL
 * overrides it anywhere else. With neither set, the url-bearing tags are
 * omitted rather than pointing at a guess.
 */
const siteOrigin = (): string => {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : "";
};

const pageTitle = `${site.developer.fullName} — ${site.developer.title}`;

/**
 * The routes App.tsx serves. Kept here rather than imported from the
 * router because the router's entries carry element factories that would drag
 * React into the config's module graph.
 */
const ROUTES = ["/", "/myworks"];

/**
 * robots.txt and sitemap.xml, emitted at build time for the same reason the
 * social tags are: the sitemap has to carry absolute URLs — the spec allows
 * nothing else — so it can only be written once the origin is known.
 *
 * With no origin available the sitemap is skipped and robots.txt ships without
 * a Sitemap: line, which is a valid robots.txt. The alternative, guessing a
 * domain, would publish a sitemap pointing at somebody else's site.
 */
const crawlerFiles = (): Plugin => ({
  name: "portfolio-crawler-files",
  apply: "build",
  generateBundle() {
    const origin = siteOrigin();

    const robots = [
      "User-agent: *",
      "Allow: /",
      "",
      "# The Draco decoder and the Stockfish WASM build are third-party",
      "# binaries with no crawlable content.",
      "Disallow: /draco/",
      ...(origin ? ["", `Sitemap: ${origin}/sitemap.xml`] : []),
      "",
    ].join("\n");

    this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });

    if (!origin) return;

    const urls = ROUTES.map((route) => {
      const loc = `${origin}${route}`;
      /* The landing page is the one that changes when a project ships; the
         other two are a static index and a game. */
      const priority = route === "/" ? "1.0" : "0.7";
      return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
    }).join("\n");

    this.emitFile({
      type: "asset",
      fileName: "sitemap.xml",
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    });
  },
});

const htmlMeta = (): Plugin => ({
  name: "portfolio-html-meta",
  transformIndexHtml: {
    order: "pre",
    handler(html) {
      const origin = siteOrigin();
      const socialUrls = site.contact.socials
        .map((social) => social.url)
        .filter((url): url is string => Boolean(url));

      const person = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: site.developer.fullName,
        jobTitle: site.developer.title,
        description: site.developer.description,
        email: `mailto:${site.contact.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: site.social.location,
        },
        knowsAbout: site.developer.disciplines,
        sameAs: socialUrls,
        ...(origin ? { url: origin } : {}),
      };

      const tags: HtmlTagDescriptor[] = [
        {
          tag: "meta",
          attrs: { name: "description", content: site.developer.description },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: { name: "author", content: site.developer.fullName },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: { name: "theme-color", content: "#0b080c" },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: { property: "og:type", content: "website" },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: { property: "og:title", content: pageTitle },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: {
            property: "og:description",
            content: site.developer.description,
          },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: { property: "og:site_name", content: site.developer.fullName },
          injectTo: "head",
        },
        /* summary_large_image only once we know the absolute origin — see the
           `if (origin)` block below. Open Graph requires og:image to be an
           absolute URL (Facebook and LinkedIn reject relative ones), so on a
           build with neither SITE_URL nor VERCEL_PROJECT_PRODUCTION_URL set
           there is no usable image URL to declare, and a large-image card with
           no image renders as a broken box. Falling back to the small square
           card is the honest degradation. */
        {
          tag: "meta",
          attrs: {
            name: "twitter:card",
            content: origin ? "summary_large_image" : "summary",
          },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: { name: "twitter:title", content: pageTitle },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:description",
            content: site.developer.description,
          },
          injectTo: "head",
        },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify(person),
          injectTo: "head",
        },
      ];

      if (origin) {
        /* public/og-image.png, generated at 1200x630 from the landing page's
           own palette and type. Width and height are declared because
           Facebook and LinkedIn render the first scrape without the image
           while they fetch it out of band; declaring the box avoids that
           first-share miss. twitter:image is declared separately because X
           does not reliably inherit og:image. */
        const ogImage = `${origin}/og-image.png`;
        tags.push(
          {
            tag: "link",
            attrs: { rel: "canonical", href: `${origin}/` },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:url", content: `${origin}/` },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:image", content: ogImage },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:image:secure_url", content: ogImage },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:image:type", content: "image/png" },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:image:width", content: "1200" },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:image:height", content: "630" },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:image:alt", content: pageTitle },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { property: "og:locale", content: "en_US" },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { name: "twitter:image", content: ogImage },
            injectTo: "head",
          },
          {
            tag: "meta",
            attrs: { name: "twitter:image:alt", content: pageTitle },
            injectTo: "head",
          }
        );
      }

      return {
        html: html.replace(
          /<title>[\s\S]*?<\/title>/,
          `<title>${pageTitle}</title>`
        ),
        tags,
      };
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlMeta(), crawlerFiles()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "three-stdlib"],
          "react-three": ["@react-three/fiber", "@react-three/drei"],
          gsap: ["gsap"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ["three", "gsap", "lenis"],
  },
});
