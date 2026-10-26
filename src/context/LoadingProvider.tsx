import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";
import { hasCharacter } from "../utils/breakpoints";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  /* The loader exists to cover the 3D character's download, and its
     percentage is fed from Scene.tsx — which only mounts above
     CHARACTER_MIN_WIDTH. The template gated the loader at 768px instead,
     so from 769px to 1024px the loading screen appeared, nothing ever
     reported progress to it, and it sat at "Loading 0%" forever with the
     whole site behind it unreachable. Same gate, one source of truth. */
  const [isLoading, setIsLoading] = useState(hasCharacter);
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };

  useEffect(() => {
    // With no loader there is no completion handler to start the intro.
    if (hasCharacter()) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    import("../components/utils/initialFX").then((module) => {
      if (cancelled || !module.initialFX) return;
      timeoutId = setTimeout(() => {
        if (!cancelled) module.initialFX();
      }, 100);
    });

    /* The template left this timeout dangling. In dev, StrictMode's
       double-mount ran initialFX twice against the same DOM, which split
       already-split text into empty spans and left the headings blank. */
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
