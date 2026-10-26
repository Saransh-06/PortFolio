import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";

/**
 * Keeps a failed 3D character from taking the whole portfolio down with it.
 *
 * The character is the only part of this page that needs a GPU: Scene.tsx
 * creates a WebGL context, and three.js throws if it cannot get one. That
 * happens more often than the hardware alone would suggest — hardware
 * acceleration switched off in Chrome, a driver on the GPU blocklist, WebGL
 * disabled by policy, a headless or virtualised display. It also covers the
 * ordinary failures: a truncated character.enc, a Draco decoder that 404s.
 *
 * Until this existed there was no boundary anywhere above Scene, so React
 * unmounted the entire tree it was rendered into — Landing, About, Career,
 * Certifications, Work, Contact, all of it — and served a blank page. A
 * portfolio that renders nothing on a machine with no working WebGL is a worse
 * outcome than one that renders everything except an ornament.
 *
 * Rendering `null` on failure is the whole recovery. Nothing else on the page
 * reads from the character, and the layout does not reserve space for it.
 */
interface Props {
  /** Called once, after the failure, so the loading screen can be released. */
  onError: () => void;
}

class CharacterBoundary extends Component<
  PropsWithChildren<Props>,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* Stripped from production bundles by terser's drop_console (see
       vite.config.ts); it is here to name the cause during development, where
       "the character is missing" is otherwise silent. */
    console.warn(
      "3D character disabled after an error:",
      error?.message,
      info.componentStack
    );
    this.props.onError();
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

export default CharacterBoundary;
