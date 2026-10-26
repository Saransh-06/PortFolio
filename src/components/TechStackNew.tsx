import { useState } from "react";
import "./styles/TechStackNew.css";
import { config } from "../config";
import { prefersReducedMotion } from "../utils/reducedMotion";

/**
 * Inverted pyramid of the stack, driven by config.techStack.
 *
 * Icons are fetched from the devicon CDN by slug. A wrong or missing slug
 * used to render a broken image; now it falls back to a text chip, so the
 * pyramid can list things devicon doesn't cover (Streamlit, XGBoost,
 * spaCy) without any risk to the layout.
 */

const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

interface Tech {
  name: string;
  /** devicon path, e.g. "python/python-original" (no .svg). */
  slug?: string;
  /** Full icon URL, for anything not in devicon. */
  url?: string;
  /** Optional link to the project's own site. */
  href?: string;
}

/** Two characters is all that fits in the 30px icon slot. */
const initials = (name: string) => {
  const cleaned = name.replace(/[^A-Za-z0-9+# ]/g, "");
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
};

const TechItem = ({ tech }: { tech: Tech }) => {
  const [failed, setFailed] = useState(false);
  const src = tech.url ?? (tech.slug ? `${DEVICON_BASE}/${tech.slug}.svg` : undefined);

  const inner = (
    <>
      {src && !failed ? (
        <img
          src={src}
          alt={tech.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="techstack-fallback" aria-hidden="true">
          {initials(tech.name)}
        </span>
      )}
      <span>{tech.name}</span>
    </>
  );

  if (tech.href) {
    return (
      <a
        href={tech.href}
        target="_blank"
        rel="noopener noreferrer"
        className="techstack-item"
        title={tech.name}
        data-cursor="disable"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="techstack-item" title={tech.name} data-cursor="disable">
      {inner}
    </div>
  );
};

const TechStackNew = () => {
  /* WCAG 2.2.2: content that moves for more than five seconds needs a way to
     stop it, and this video loops forever with no controls. There is no poster
     frame to fall back to, so under prefers-reduced-motion the video simply is
     not rendered and the container paints a static backdrop instead
     (TechStackNew.css). Read at render, not in an effect, so the video element
     is never created and the file is never fetched. */
  const reduced = prefersReducedMotion();

  return (
    <div className="techstack-new">
      {/* Decorative background — nothing here is content. */}
      <div
        className="techstack-video-container"
        data-static={reduced}
        aria-hidden="true"
      >
        {!reduced && (
          <video autoPlay loop muted playsInline className="techstack-video">
            <source src="/video/video.webm" type="video/webm" />
          </video>
        )}
        {/* Dark Overlay */}
        <div className="techstack-overlay"></div>
      </div>

      {/* Content */}
      <div className="techstack-content">
        <h2>Tech Stack</h2>

        <div className="techstack-pyramid">
          {config.techStack.map((row, rowIndex) => (
            <div key={rowIndex} className="techstack-row">
              {row.map((tech, techIndex) => (
                <TechItem key={techIndex} tech={tech as Tech} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStackNew;
