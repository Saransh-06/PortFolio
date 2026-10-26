import { TextSplitter } from "../../utils/textSplitter";
import gsap from "gsap";
import { lenis } from "../Navbar";
import { prefersReducedMotion } from "../../utils/reducedMotion";

export function initialFX() {
  document.body.style.overflowY = "auto";
  if (lenis) {
    lenis.start();
  }
  document.getElementsByTagName("main")[0].classList.add("main-active");

  if (prefersReducedMotion()) {
    /* The same end state as the sequence below, applied in a single frame:
       the page reads as loaded, nothing travels and nothing blurs.

       Two deliberate differences from the animated path:

       1. The text is never split. Every reveal below needs per-character
          spans to stagger, and there is nothing to stagger here — leaving
          the headings as ordinary text nodes also keeps screen readers from
          announcing them letter by letter.
       2. The role lines keep only their first half. LoopText is an
          indefinite crossfade, so it has no finished state to jump to;
          .landing-h2-2 and .landing-h2-info-1 stay at the opacity 0 floor
          Landing.css gives them and the visible half never changes. One
          honest role line beats a line that swaps itself forever.

       Split into two set() calls so `filter` never lands on .header, which
       is position: fixed — a filter on it would make it a containing block
       for its own fixed descendants. */
    gsap.set("body", { backgroundColor: "#0b080c" });
    gsap.set(
      [
        ".landing-info h3",
        ".landing-intro h2",
        ".landing-intro h1",
        ".landing-h2-info",
        ".landing-h2-1",
        ".landing-info-h2",
      ],
      { opacity: 1, y: 0, filter: "blur(0px)" }
    );
    gsap.set([".header", ".icons-section", ".nav-fade"], { opacity: 1 });
    return;
  }

  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
    delay: 1,
  });

  const selectors = [".landing-info h3", ".landing-intro h2", ".landing-intro h1"];
  const elements = selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
  var landingText = new TextSplitter(elements, {
    type: "chars,lines",
    linesClass: "split-line",
  });
  gsap.fromTo(
    landingText.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  let TextProps = { type: "chars,lines", linesClass: "split-h2" };

  var landingText2 = new TextSplitter(".landing-h2-info", TextProps);
  gsap.fromTo(
    landingText2.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );
  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );

  var landingText3 = new TextSplitter(".landing-h2-info-1", TextProps);
  var landingText4 = new TextSplitter(".landing-h2-1", TextProps);
  var landingText5 = new TextSplitter(".landing-h2-2", TextProps);

  /* Below 768px the second half of each role pair is display:none (see
     Landing.css — the stacked mobile layout can't hold two absolutely
     positioned lines in one slot). Running the crossfade anyway animated
     the VISIBLE half up and out of its clipping box on schedule, then
     waited on a partner that would never appear: the roles simply
     vanished about four seconds in and stayed gone. */
  const rolesAlternate = window.matchMedia("(min-width: 769px)").matches;
  if (rolesAlternate) {
    LoopText(landingText2, landingText3);
    LoopText(landingText4, landingText5);
    /* Both loops have now parked their alternate half's characters at
       opacity 0, so lifting the containers off the floor CSS gives them
       cannot flash a second string over the first. See Landing.css. */
    gsap.set([".landing-h2-2", ".landing-h2-info-1"], { opacity: 1 });
  }
}

/**
 * Alternates one role line between its two strings.
 *
 * The two strings sit directly on top of each other: the second half of
 * each pair is absolutely positioned at the same origin as the first (see
 * Landing.css). So exactly one of them may be visible at any instant.
 *
 * The version this replaces animated `y` and set `opacity` exactly once —
 * on the incoming half, the first time it appeared. Two things followed:
 *
 *   1. The outgoing string was never faded at all. Once its partner had
 *      arrived, both were at opacity 1, and stayed there for the life of
 *      the page.
 *   2. `.split-char` is a plain inline <span>, and CSS transforms do not
 *      apply to non-replaced inline elements — so every `y` tween was a
 *      no-op that moved nothing. The two strings were not merely both
 *      visible, they were both visible at the same coordinates.
 *
 * The result was "AI / ML ENGINEER" and "APPLIED ML ENGINEER" rendered
 * permanently on top of one another, left-aligned to the same x, which is
 * why the line read as a jumble of letters instead of as text. A 0.1s
 * stagger across ~19 characters smeared the changeover over 1.9s on top of
 * that, so it never even resolved into two legible strings.
 *
 * This version is strictly sequential: the visible string fades out
 * completely, and only then does its partner begin to fade in. There is no
 * point in the cycle at which two strings are on screen together.
 */
function LoopText(Text1: TextSplitter, Text2: TextSplitter) {
  const first = Text1.chars;
  const second = Text2.chars;
  /* A missing half means the markup changed under us. A static line beats
     a timeline animating an empty node list. */
  if (!first.length || !second.length) return;

  const HOLD = 3.6; // seconds a string stays fully readable
  const FADE = 0.5; // per-character fade duration
  const STAGGER = 0.02;

  /* One STEP is a complete fade of the LONGER of the two strings. Both
     halves use the same figure, which is what keeps the schedule below
     symmetric — each string gets the same time on screen. */
  const STEP = FADE + STAGGER * Math.max(first.length, second.length);

  /* immediateRender: false matters. A fromTo() added to a timeline applies
     its from-values the moment it is created, not when the playhead
     reaches it — which would park both halves at opacity 0 before the
     timeline had played a frame, blanking the line. */
  const OUT = {
    opacity: 0,
    yPercent: -40,
    duration: FADE,
    ease: "power2.in",
    stagger: STAGGER,
    immediateRender: false,
  };
  /** Invisible and sitting low: where a string waits for its turn. */
  const PARKED = { opacity: 0, yPercent: 40 };
  const IN = {
    opacity: 1,
    yPercent: 0,
    duration: FADE,
    ease: "power2.out",
    stagger: STAGGER,
    immediateRender: false,
  };

  gsap.set(first, { opacity: 1, yPercent: 0 });
  gsap.set(second, PARKED);

  /* Ends with `first` visible and `second` invisible — the same state it
     starts in — so the repeat wraps without a jump and without needing a
     reset step. */
  return gsap
    .timeline({ repeat: -1 })
    .to(first, OUT, HOLD)
    .fromTo(second, PARKED, IN, HOLD + STEP)
    .to(second, OUT, HOLD * 2 + STEP * 2)
    .fromTo(first, PARKED, IN, HOLD * 2 + STEP * 3);
}
