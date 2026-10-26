import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../utils/reducedMotion";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => {
    /* Entrance-only: every tween here is a fromTo that ends at the element's
       own resting style, and nothing in Contact.css hides these to begin with.
       Not building the timeline therefore leaves the section fully readable —
       the from-states are never applied, so there is nothing to undo. */
    if (prefersReducedMotion()) return;

    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });

    // Animate title from bottom
    contactTimeline.fromTo(
      ".contact-section h3",
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }
    );

    // Animate contact boxes with stagger from bottom
    contactTimeline.fromTo(
      ".contact-box",
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      },
      "-=0.4"
    );

    // Clean up
    return () => {
      contactTimeline.kill();
    };
  }, []);

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>{config.developer.fullName}</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              {/* data-selectable opts out of the global user-select: none.
                  The address is the one thing on this page a visitor needs to
                  take away, and it could not be selected or copied. */}
              <a
                href={`mailto:${config.contact.email}`}
                data-cursor="disable"
                data-selectable
              >
                {config.contact.email}
              </a>
            </p>
            <h4>Location</h4>
            <p>
              <span>
                {config.social.location} · {config.social.timezone}
              </span>
            </p>
            <h4>{config.contact.availability.status}</h4>
            <p>
              <span>{config.contact.availability.detail}</span>
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            {/* Driven by config so a removed account can't leave a dead
                link behind. Handles with no linkable profile page render
                as plain text. */}
            {config.contact.socials.map((social) =>
              social.url ? (
                <a
                  key={social.icon}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social"
                >
                  {social.label} <MdArrowOutward />
                </a>
              ) : (
                <span
                  key={social.icon}
                  className="contact-social contact-social-static"
                  data-selectable
                >
                  {social.label} — {social.handle}
                </span>
              )
            )}
          </div>
          <div className="contact-box contact-box-me">
            {/* The whole page is a stylised 3D avatar; the last thing you see
                is the person it stands for. Placed here rather than in About
                because About's desktop layout reserves its left half for the
                pinned character — a portrait there would collide with it.

                Fails to nothing, not to a broken image: `photo` being a string
                only means someone typed a path. Same reason ProjectCard's
                GridImage exists. */}
            {config.developer.photo && !photoFailed && (
              <img
                className="contact-portrait"
                src={config.developer.photo}
                alt={config.developer.photoAlt}
                width={220}
                height={220}
                loading="lazy"
                decoding="async"
                onError={() => setPhotoFailed(true)}
              />
            )}
            <p className="contact-built">
              Built by <span>{config.developer.fullName}</span>
            </p>
            <p className="contact-copyright">
              <MdCopyright /> {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
