import { IconType } from "react-icons";
import {
  FaDiscord,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaReddit,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { config } from "../config";

/** Icon keys used by `config.contact.socials`. Anything not listed here
 *  simply won't render in the rail — add the import and the entry. */
export const socialIcons: Record<string, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  reddit: FaReddit,
  discord: FaDiscord,
};

const SocialIcons = () => {
  /** Only linkable profiles that opted into the rail. */
  const railSocials = config.contact.socials.filter(
    (social) => social.rail && social.url && socialIcons[social.icon]
  );

  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;
    if (!social) return;

    const cleanups: Array<() => void> = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;
      if (!link) return;

      const rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = 0;
      let currentY = 0;
      let frame = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        frame = requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      updatePosition();

      // The template listened on `document` but removed from `elem`, so
      // the handler and its rAF loop both leaked on unmount.
      cleanups.push(() => {
        document.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(frame);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        {railSocials.map((social) => {
          const Icon = socialIcons[social.icon];
          return (
            <span key={social.icon}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
              >
                <Icon />
              </a>
            </span>
          );
        })}
      </div>
      <a
        className="resume-button"
        href={config.developer.resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
