/**
 * Whether the visitor has asked their operating system to minimise animation.
 *
 * Called at each animation entry point rather than cached in a module
 * constant. `setSplitText`, `setCharTimeline` and `setAllTimeline` all re-run
 * on resize, so someone who flips the system setting mid-session gets the
 * static page back on their next resize instead of having to reload. The
 * one-shot page-load sequence in initialFX still needs a reload, which is the
 * usual trade for a sequence that only ever plays once.
 *
 * Guarded on matchMedia rather than assuming it: this module is imported by
 * code that runs during module evaluation, and a missing matchMedia should
 * mean "animate normally", not a TypeError that takes the page down.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
