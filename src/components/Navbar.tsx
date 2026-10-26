import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import Lenis from "lenis";
import "./styles/Navbar.css";
import { config } from "../config";
import { prefersReducedMotion } from "../utils/reducedMotion";

gsap.registerPlugin(ScrollTrigger);
export let lenis: Lenis | null = null;

const Navbar = () => {
  useEffect(() => {
    /* Smooth scroll is itself motion: it decouples the page from the wheel and
       keeps gliding after the visitor has stopped, which is exactly the
       sensation reduced motion exists to switch off. Left null, the page
       scrolls natively — initialFX and the click handler below both already
       treat lenis as optional. */
    if (!prefersReducedMotion()) {
      lenis = new Lenis({
        duration: 1.7,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.7,
        touchMultiplier: 2,
        infinite: false,
      });

      // Start paused
      lenis.stop();

      // Handle smooth scroll animation frame
      function raf(time: number) {
        lenis?.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Handle navigation links
    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        /* preventDefault only once there is something to replace the default
           with. The version this replaces cancelled the jump first and asked
           about lenis second, so with no lenis — reduced motion, or a failed
           init — the nav links above 1024px silently did nothing at all. */
        if (window.innerWidth <= 1024 || !lenis) return;
        let elem = e.currentTarget as HTMLAnchorElement;
        let section = elem.getAttribute("data-href");
        if (!section) return;
        const target = document.querySelector(section) as HTMLElement;
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.5,
        });
      });
    });

    // Handle resize
    window.addEventListener("resize", () => {
      lenis?.resize();
    });

    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return (
    <>
      <div className="header">
        {/* Was <a href="/#">, which is a document navigation: clicking the
            logo on the home page tore the SPA down and re-downloaded the 580 kB
            three bundle to arrive back where you already were. scrollTo(0) is
            what the logo actually means here, and the Link covers the case
            where you are on /myworks or /play. */}
        <Link
          to="/"
          className="navbar-title"
          data-cursor="disable"
          onClick={() => {
            if (window.location.pathname === "/") {
              lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0 });
            }
          }}
        >
          {config.developer.initials}
        </Link>
        <a
          href={`mailto:${config.contact.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          {config.contact.email}
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          {/* Fourth item, and the shortest label of the four on purpose: the
              row has to stay inside its half of the header at 1200px, and
              "CERTIFICATIONS" would not. The section is a wall of verifiable
              credential links, which is the first thing a recruiter goes
              looking for and was previously reachable only by scrolling. */}
          <li>
            <a data-href="#certifications" href="#certifications">
              <HoverLinks text="CERTS" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
