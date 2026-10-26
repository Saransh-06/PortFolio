import "./styles/Work.css";
import WorkImage from "./WorkImage";
import ProjectCard from "./ProjectCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { config } from "../config";
import { Link } from "react-router-dom";
import { isMobileWidth } from "../utils/breakpoints";
import { prefersReducedMotion } from "../utils/reducedMotion";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  useEffect(() => {
    // Pinning a horizontal scroll hijacks vertical touch scrolling; the
    // mobile layout stacks the cards instead (see Work.css).
    if (isMobileWidth()) return;

    /* Reduced motion takes the same exit, but it needs help the mobile path
       gets for free: the stacking rules are inside a max-width query, so at
       desktop width .work-flex is still a row and four of the five cards
       would sit off the right edge of a section that no longer translates.
       Work.css repeats the layout half of that block under the same
       prefers-reduced-motion query — the pin goes away and the row becomes a
       column, so the cards are read by scrolling down. */
    if (prefersReducedMotion()) return;

    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      if (box.length === 0) return;
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      let padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        id: "work",
        invalidateOnRefresh: true,
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    // Refresh ScrollTrigger after layout settles
    ScrollTrigger.refresh();

    // Clean up
    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {config.projects.slice(0, 5).map((project, index) => (
            <div className="work-box" key={project.id}>
              <div className="work-info">
                {/* The 01/02/03 was an <h3> and the project title an <h4>,
                    so every card announced its own ordinal as a heading and
                    ranked the project name below it. The numeral is a label,
                    and the title is the heading. */}
                <div className="work-title">
                  <div className="work-index" aria-hidden="true">
                    0{index + 1}
                  </div>

                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.technologies}</p>
              </div>
              <WorkImage
                image={project.image}
                alt={project.title}
                link={project.link}
                fallback={<ProjectCard project={project} index={index} variant="work" />}
              />
            </div>
          ))}
          {/* See All Works Button */}
          <div className="work-box work-box-cta">
            <div className="see-all-works">
              <h3>Want to see more?</h3>
              <p>Explore all of my projects and creations</p>
              <Link to="/myworks" className="see-all-btn" data-cursor="disable">
                See All Works →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
