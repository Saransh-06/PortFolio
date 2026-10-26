import { Link } from "react-router-dom";
import { config } from "../config";
import { useDocumentMeta } from "../utils/useDocumentMeta";
import "./NotFound.css";

/**
 * The catch-all route.
 *
 * vercel.json rewrites every unmatched path to index.html so the SPA can route
 * it. React Router then matched none of them, rendered nothing, and the visitor
 * got a blank white page with no header, no navigation and no way back — at
 * HTTP 200, so crawlers indexed the emptiness as a real page. Any stale link,
 * any typo, any /resume guess landed here.
 *
 * Deliberately not styled as a set piece: a 404 is an interruption, and the job
 * is to name what happened and offer the three places a visitor was probably
 * heading.
 */
const NotFound = () => {
  useDocumentMeta(
    `Page not found — ${config.developer.fullName}`,
    "This address does not exist on the site."
  );

  return (
    <main className="notfound">
      <div className="notfound-inner">
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">This page doesn&apos;t exist</h1>
        <p className="notfound-body">
          The link may be out of date, or the address mistyped. Everything on
          this site is reachable from one of these:
        </p>
        <nav className="notfound-links" aria-label="Where to go instead">
          <Link to="/" className="notfound-link" data-cursor="disable">
            Home
          </Link>
          <Link to="/myworks" className="notfound-link" data-cursor="disable">
            All projects
          </Link>
          <a
            href={`mailto:${config.contact.email}`}
            className="notfound-link"
            data-cursor="disable"
          >
            {config.contact.email}
          </a>
        </nav>
      </div>
    </main>
  );
};

export default NotFound;
