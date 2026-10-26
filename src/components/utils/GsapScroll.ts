import * as THREE from "three";
import gsap from "gsap";
import { prefersReducedMotion } from "../../utils/reducedMotion";

/* setCharTimeline() runs once per GLB load (character.ts) and again on every
   qualifying window resize (resizeUtils.ts → handleResize), and that resize
   listener is undebounced, so one drag of a window edge calls it roughly once
   per frame.

   The 200ms timer and the repeat:-1 screenlight timeline below were both
   created fresh on every one of those calls with no handle kept. Neither is a
   ScrollTrigger, so handleResize's blanket `ScrollTrigger.getAll().kill()`
   sweep never reached them the way it reaches tl1/tl2/tl3: they accumulated
   one per call for the life of the page. N timers waking the main thread at
   5Hz, and N infinite tweens all writing the same material's
   emissiveIntensity — which lighting.ts multiplies straight into the point
   light on the character's face, turning a slow breathing flicker into a
   strobe that got worse with every resize.

   Held at module scope and disposed at the top of the next call, so each
   invocation only ever discards what the previous one created. On the first
   call both are null, so first load is unchanged. No ScrollTrigger is touched
   and no tween is reordered or retimed. */
let screenFlickerInterval: ReturnType<typeof setInterval> | null = null;
let screenFlickerTimeline: gsap.core.Timeline | null = null;

/** Stops the screenlight flicker. Called at the top of setCharTimeline before
 *  a new one is built, and from Scene's cleanup on unmount — without the
 *  latter, dragging below 1024px unmounts the character (MainContainer gates on
 *  CHARACTER_MIN_WIDTH) while the timer and the infinite tween keep running
 *  against its now-detached material. */
export function disposeCharExtras() {
  if (screenFlickerInterval !== null) clearInterval(screenFlickerInterval);
  screenFlickerInterval = null;
  screenFlickerTimeline?.kill();
  screenFlickerTimeline = null;
}

export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  disposeCharExtras();
  const reduced = prefersReducedMotion();
  let intensity: number = 0;
  /* The flicker is ambient motion with no end state — the one thing reduced
     motion most clearly rules out. Skipping the timer also keeps a 5Hz wake-up
     off the main thread for the life of the page. */
  if (!reduced) {
    screenFlickerInterval = setInterval(() => {
      intensity = Math.random();
    }, 200);
  }
  let screenLight: any, monitor: any;
  character?.children.forEach((object: any) => {
    if (object.name === "Plane004") {
      object.children.forEach((child: any) => {
        child.material.transparent = true;
        child.material.opacity = 0;
        if (child.material.name === "Material.027") {
          monitor = child;
          child.material.color.set("#FFFFFF");
        }
      });
    }
    if (object.name === "screenlight") {
      object.material.transparent = true;
      object.material.opacity = 0;
      object.material.emissive.set("#C8BFFF");
      if (!reduced) {
        screenFlickerTimeline = gsap
          .timeline({ repeat: -1, repeatRefresh: true })
          .to(object.material, {
            emissiveIntensity: () => intensity * 8,
            duration: () => Math.random() * 0.6,
            delay: () => Math.random() * 0.1,
          });
      }
      screenLight = object;
    }
  });
  let neckBone = character?.getObjectByName("spine005");

  if (reduced) {
    /* Everything below is either scroll-scrubbed parallax or a camera move,
       so none of it is built. That leaves one thing to repair: the walk above
       just parked the monitor and its screenlight at opacity 0 because tl2 is
       what normally raises them, and skipping tl2 would leave the character
       sitting at a dead black screen.

       emissiveIntensity 4 is the midpoint of the flicker's 0–8 range, so
       lighting.ts — which multiplies this straight into the point light on
       the character's face — lands on the same average brightness the
       animated version averages out to, just without the pulse.

       .what-box-in is display:flex in WhatIDo.css and only tl2 ever sets it
       to none, so it needs nothing here; it is set anyway because that
       coupling lives in another file and a silently empty section is an
       expensive way to find out it changed. */
    if (monitor) gsap.set(monitor.material, { opacity: 1 });
    if (screenLight) {
      gsap.set(screenLight.material, { opacity: 1, emissiveIntensity: 4 });
    }
    gsap.set(".what-box-in", { display: "flex" });
    return;
  }

  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  if (window.innerWidth > 1024) {
    if (character) {
      tl1
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
        .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

      tl2
        .to(
          camera.position,
          { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
          0
        )
        .to(".about-section", { y: "30%", duration: 6 }, 0)
        .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
        .fromTo(
          ".character-model",
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
          0
        )
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
        .to(neckBone!.rotation, { x: 0.6, delay: 2, duration: 3 }, 0)
        .to(monitor.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
        .to(screenLight.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0)
        .fromTo(
          ".what-box-in",
          { display: "none" },
          { display: "flex", duration: 0.1, delay: 6 },
          0
        )
        .fromTo(
          monitor.position,
          { y: -10, z: 2 },
          { y: 0, z: 0, delay: 1.5, duration: 3 },
          0
        )
        .fromTo(
          ".character-rim",
          { opacity: 1, scaleX: 1.4 },
          { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
          0.3
        );

      tl3
        .fromTo(
          ".character-model",
          { y: "0%" },
          { y: "-100%", duration: 4, ease: "none", delay: 1 },
          0
        )
        .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
        .to(character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
    }
  } else {
    if (character) {
      const tM2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".what-box-in",
          start: "top 70%",
          end: "bottom top",
        },
      });
      tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
    }
  }
}

export function setAllTimeline() {
  if (prefersReducedMotion()) {
    /* Both timelines below are pure entrances — a spine that draws itself
       down the career list, and cards that rise as they enter. Their finished
       state is the whole content, so it is applied directly.

       .career-dot is the exception worth naming: its pulse is a CSS keyframe
       (Career.css) set to `infinite`, and the animated path relies on the
       tween below to hand it an iteration count of 1 to settle it. Nothing
       hands it anything here, so index.css stops it in the same media query
       that got us into this branch. */
    gsap.set(".career-timeline", { maxHeight: "100%", opacity: 1 });
    gsap.set(".career-info-box", { opacity: 1 });
    gsap.set([".certs-section h2", ".certs-lede", ".certs-card"], {
      opacity: 1,
      y: 0,
    });
    gsap.set(".certs-standalone", { opacity: 1 });
    return;
  }

  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 50%",
      end: "bottom 30%",
      scrub: 1.5,
      invalidateOnRefresh: true,
    },
  });
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "0%" },
      { maxHeight: "100%", duration: 1, ease: "none" },
      0
    )

    .fromTo(
      ".career-timeline",
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
      0
    )
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  if (window.innerWidth > 1024) {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "20%", duration: 0.5, delay: 0.2 },
      0
    );
  } else {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: 0, duration: 0.5, delay: 0.2 },
      0
    );
  }

  /* Certifications: plays once on enter rather than scrubbing.

     The career timeline is scrubbed because its lit spine is meant to track
     the reader's position. This section is a reference table someone scrolls
     back up to re-read, and tying opacity to scroll position would fade a
     card out from under them while they were reading it. */
  const certsTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".certs-section",
      start: "top 68%",
      once: true,
    },
  });
  certsTimeline
    .fromTo(
      ".certs-section h2",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      0
    )
    .fromTo(
      ".certs-lede",
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      0.12
    )
    .fromTo(
      ".certs-card",
      { opacity: 0, y: 34 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.11, ease: "power2.out" },
      0.2
    )
    .fromTo(
      ".certs-standalone",
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      0.55
    );
}
