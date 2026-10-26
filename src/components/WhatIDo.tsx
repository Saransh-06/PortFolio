import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    /* The listeners have to be kept, not re-created. The previous cleanup
       called removeEventListener with a freshly-written arrow function, which
       is never reference-equal to the one that was added — so every listener
       survived unmount and each remount stacked another one on the same node.
       Two panels, one listener leaked per panel per mount. */
    const attached: Array<{
      node: HTMLDivElement;
      handler: (event: MouseEvent) => void;
    }> = [];

    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (!container) return;
        container.classList.remove("what-noTouch");
        const handler = () => handleClick(container);
        container.addEventListener("click", handler);
        attached.push({ node: container, handler });
      });
    }

    return () => {
      attached.forEach(({ node, handler }) => {
        node.removeEventListener("click", handler);
      });
    };
  }, []);
  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            &nbsp;I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
            tabIndex={0}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3>{config.skills.engineering.title}</h3>
              <h4>{config.skills.engineering.description}</h4>
              <p>
                {config.skills.engineering.details}
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {config.skills.engineering.tools.map((tool, index) => (
                  <div key={index} className="what-tags">{tool}</div>
                ))}
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          {/* tabIndex so the panel can be opened without a pointer — the
              expansion and the tool chips are gated on :hover / :focus-within
              in WhatIDo.css. No role: nothing is toggled that assistive tech
              cannot already read, the reveal is purely visual. */}
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
            tabIndex={0}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>{config.skills.shipping.title}</h3>
              <h4>{config.skills.shipping.description}</h4>
              <p>
                {config.skills.shipping.details}
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {config.skills.shipping.tools.map((tool, index) => (
                  <div key={index} className="what-tags">{tool}</div>
                ))}
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
