import { MdArrowOutward } from "react-icons/md";
import "./styles/PageLinks.css";
import { config } from "../config";

/**
 * Résumé and email, for the pages that are not the home page.
 *
 * The social rail and the RESUME button live inside the home page's landing
 * section, so /myworks and /play had exactly one way out — "Back to Home" —
 * and no way to contact him or read the CV without going back first. This sits
 * next to the back link on both pages.
 *
 * Deliberately two items. The full social rail here would compete with the
 * page's own content; a CV and an address are what someone who just read the
 * work actually wants next.
 */
const PageLinks = () => (
  <span className="page-links">
    <a
      className="page-link"
      href={config.developer.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="disable"
    >
      Résumé <MdArrowOutward />
    </a>
    <a
      className="page-link"
      href={`mailto:${config.contact.email}`}
      data-cursor="disable"
      data-selectable
    >
      {config.contact.email}
    </a>
  </span>
);

export default PageLinks;
