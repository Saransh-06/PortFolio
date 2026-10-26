import { config } from "../config";
import "./styles/CallToAction.css";

/** LinkedIn is the "hire me" destination; fall back to email if it's ever
 *  removed from config so this button can't become a dead link. */
const hireUrl =
  config.contact.socials.find((social) => social.icon === "linkedin")?.url ??
  `mailto:${config.contact.email}`;

const CallToAction = () => {
  return (
    <div className="cta-section">
      <div className="cta-buttons">
        <a
          href={hireUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-btn cta-btn-hire"
          data-cursor="disable"
        >
          Hire Me →
        </a>
      </div>
    </div>
  );
};

export default CallToAction;
