/**
 * The viewport thresholds, in one place.
 *
 * These were hardcoded as bare numbers in seven files and had already
 * drifted apart. The drift caused a hard bug: the loading screen showed
 * whenever the viewport was wider than 768px, but the loading PERCENTAGE
 * is driven from the 3D character's own load progress (Scene.tsx →
 * setProgress), and the character only mounts above 1024px. So between
 * 769px and 1024px — every tablet in portrait, and a desktop window
 * dragged narrow — the site showed "Loading 0%" forever. Nothing behind
 * it ever ran, because initialFX() is called from the loader's completion
 * handler.
 *
 * CHARACTER is therefore the threshold that matters: the loader exists to
 * cover the character's download, so anything that can't show a character
 * must not show the loader either.
 */

/** Above this width the 3D character mounts, and the loading screen that
 *  covers its download is shown. At or below it, neither. */
export const CHARACTER_MIN_WIDTH = 1024;

/** At or below this width the layout is a single stacked column: no
 *  horizontal work-scroll pinning, no role-line crossfade. */
export const MOBILE_MAX_WIDTH = 768;

export const hasCharacter = () => window.innerWidth > CHARACTER_MIN_WIDTH;

export const isMobileWidth = () => window.innerWidth <= MOBILE_MAX_WIDTH;
