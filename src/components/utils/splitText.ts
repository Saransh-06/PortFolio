import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextSplitter } from "../../utils/textSplitter";
import { prefersReducedMotion } from "../../utils/reducedMotion";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: TextSplitter;
}

gsap.registerPlugin(ScrollTrigger);

/* setSplitText() runs on every resize AND was re-registering itself as a
   ScrollTrigger "refresh" listener on each call — and a refresh fires on
   resize. Two resizes meant two listeners, each of which called the
   function again, each adding another. The listener list grew without
   bound and every entry re-split the same DOM. Registered once here
   instead, outside the function. */
let refreshHooked = false;

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (!refreshHooked) {
    refreshHooked = true;
    ScrollTrigger.addEventListener("refresh", () => setSplitText());
  }

  /* Below 900px the reveal is skipped: the text is already in the
     viewport when these sections mount, so a scroll-triggered fade in
     would either never fire or fire off-screen. `.para`/`.title` carry no
     opacity of their own, so skipping leaves them plainly visible.

     Reduced motion takes that same exit, and for the same reason it is safe:
     the only thing these tweens contribute is the entrance. Returning here
     also leaves the copy unsplit, so a screen reader gets whole words
     instead of a run of single-character spans. */
  if (window.innerWidth < 900 || prefersReducedMotion()) return;
  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";
  const ToggleAction = "play pause resume reverse";

  paras.forEach((para: ParaElement) => {
    para.classList.add("visible");
    if (para.anim) {
      para.anim.progress(1).kill();
      para.split?.revert();
    }

    para.split = new TextSplitter(para, {
      type: "lines,words",
      linesClass: "split-line",
    });

    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 80 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: para.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 1,
        ease: "power3.out",
        y: 0,
        stagger: 0.02,
      }
    );
  });
  titles.forEach((title: ParaElement) => {
    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
    }
    title.split = new TextSplitter(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 80, rotate: 10 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.8,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,
        stagger: 0.03,
      }
    );
  });
}
