import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { LoadingProvider } from "./context/LoadingProvider";

/* Announced rather than silent. The bare <div>Loading...</div> this replaces
   was invisible to assistive tech: a screen reader user pressing a nav link got
   no indication that anything was happening until the chunk arrived. */
const RouteFallback = () => (
  <div className="route-fallback" role="status" aria-live="polite">
    Loading…
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LoadingProvider>
              <Suspense>
                <MainContainer>
                  <Suspense>
                    <CharacterModel />
                  </Suspense>
                </MainContainer>
              </Suspense>
            </LoadingProvider>
          }
        />
        <Route
          path="/myworks"
          element={
            <Suspense fallback={<RouteFallback />}>
              <MyWorks />
            </Suspense>
          }
        />
        {/* Without this, the vercel.json SPA rewrite handed every unmatched
            path to a router that matched nothing, and the visitor got a blank
            page at HTTP 200. */}
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
