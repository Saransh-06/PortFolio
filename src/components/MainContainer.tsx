import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Certifications from "./Certifications";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import CharacterBoundary from "./CharacterBoundary";
import setSplitText from "./utils/splitText";
import { hasCharacter } from "../utils/breakpoints";
import { useLoading } from "../context/LoadingProvider";

const MainContainer = ({ children }: PropsWithChildren) => {
  /* One gate, not three. The template read innerWidth against 1024 and
     768 separately here, which allowed a state where isDesktopView was
     true but the loader's threshold disagreed. hasCharacter() is now the
     single answer to "does this viewport get a 3D character?" — and the
     loader in LoadingProvider asks the same question. */
  const [showCharacter, setShowCharacter] = useState<boolean>(hasCharacter);
  const [characterReady, setCharacterReady] = useState(false);
  const [characterFailed, setCharacterFailed] = useState(false);
  const { setLoading } = useLoading();

  /* The loading screen is driven entirely by Scene.tsx's download progress
     (Loading.tsx only advances at percent >= 100), so a character that dies
     before reporting anything would leave the loader parked at 0% with the
     finished site sealed behind it — the same failure the 769–1024px gate
     above was fixed for. Handing the loader a completed download lets it run
     its own closing sequence, which already calls initialFX and clears
     isLoading, rather than duplicating that here. */
  const handleCharacterError = useCallback(() => {
    setCharacterFailed(true);
    setLoading(100);
  }, [setLoading]);

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setShowCharacter(hasCharacter());
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  useEffect(() => {
    if (!hasCharacter()) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    /* Deferred so the first paint isn't competing with 1.5 MB of model
       decrypt plus a WebGL context. The loader is on screen either way. */
    const mountCharacter = () => setCharacterReady(true);

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(mountCharacter, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(mountCharacter, 1200);
    }

    return () => {
      if (idleId !== undefined && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {showCharacter && characterReady && !characterFailed && (
        <CharacterBoundary onError={handleCharacterError}>
          {children}
        </CharacterBoundary>
      )}
      <div className="container-main">
        <Landing />
        <About />
        <WhatIDo />
        <Career />
        <Certifications />
        <Work />
        <TechStackNew />
        <CallToAction />
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;
