import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize, { resizeStage } from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { disposeCharExtras } from "../utils/GsapScroll";
import { setProgress } from "../Loading";
import { prefersReducedMotion } from "../../utils/reducedMotion";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const stageObserver = useRef<ResizeObserver | null>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;
      /* Held by identity so the cleanup can actually remove it. The template
         registered a fresh arrow function here and passed a second, different
         arrow to removeEventListener, so the listener — and the renderer,
         scene and character it closed over — outlived every unmount. */
      let onWindowResize: (() => void) | null = null;

      /* The GLB takes ~1.5s to decrypt and parse, which is long enough for the
         mount that asked for it to be gone by the time it lands: React 18
         StrictMode double-invokes this effect in dev, and in production
         MainContainer unmounts Scene the moment the window crosses below
         CHARACTER_MIN_WIDTH. Without this flag both continuations ran and both
         called scene.add() on the same THREE.Scene (sceneRef is a useRef, so
         it survives the remount) — two full characters in one scene, two
         intros, two resize listeners, one of which could never be removed
         because it was assigned after its own cleanup had already run. */
      let cancelled = false;
      let rafId = 0;

      /* Read once per mount. Everything perpetual about the character — the
         looping key/typing/blink clips, the head that follows the pointer, the
         eyebrow raise on hover — is gated on this. The render loop itself keeps
         running: this template resizes the canvas without re-rendering it, so a
         loop that stopped would leave a stretched or blank canvas after the
         first window resize. A static scene re-rendered each frame is idle GPU
         work, not motion. */
      const reduced = prefersReducedMotion();

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (cancelled) return;
        if (gltf) {
          const animations = setAnimations(gltf, reduced);
          hoverDivRef.current &&
            !reduced &&
            animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          screenLight = character.getObjectByName("screenlight") || null;
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
          /* Two listeners, deliberately, because they cost very different
             amounts.

             The window `resize` path is the template's: it rebuilds the scroll
             timelines, which means killing every ScrollTrigger on the page
             first. Fine when someone drags a window edge.

             The observer is for the case a `resize` listener cannot see: the
             page mounts short enough to have no scrollbar, content arrives, a
             15px scrollbar appears and the stage narrows. The canvas used to
             keep its mount-time inline width, overhang its container by the
             width of the scrollbar, and draw the figure half a scrollbar right
             of the page's centre — which the role lines beside it are
             positioned against (see the clearance note in Landing.css). That
             needs the renderer resized and nothing else, so it calls
             resizeStage() and leaves the timelines alone. Routing it through
             handleResize() instead destroyed every scroll reveal on the page on
             every single page load. */
          onWindowResize = () =>
            handleResize(renderer, camera, canvasDiv, character);
          window.addEventListener("resize", onWindowResize);

          if (canvasDiv.current) {
            stageObserver.current = new ResizeObserver(() =>
              resizeStage(renderer, camera, canvasDiv)
            );
            stageObserver.current.observe(canvasDiv.current);
          }
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      /* Registered by identity, not wrapped in a fresh arrow — the cleanup
         below removes this exact reference, and a wrapper made that a no-op. */
      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        rafId = requestAnimationFrame(animate);
        if (headBone) {
          if (!reduced) {
            handleHeadRotation(
              headBone,
              mouse.x,
              mouse.y,
              interpolation.x,
              interpolation.y,
              THREE.MathUtils.lerp
            );
          }
          /* Not motion — this is the monitor's glow on the face, and it has to
             be positioned every frame whether the head turns or not. */
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        /* Order matters: stop the loop before disposing what it draws with.
           The template never cancelled this rAF chain, so every unmount left an
           immortal loop calling render() on a disposed renderer with a detached
           canvas. Chrome silently drops the oldest context past ~16 live ones,
           which is how the character eventually vanished outright after enough
           crossings of the 1024px boundary. */
        cancelled = true;
        cancelAnimationFrame(rafId);
        clearTimeout(debounce);
        disposeCharExtras();
        scene.clear();
        renderer.dispose();
        stageObserver.current?.disconnect();
        stageObserver.current = null;
        if (onWindowResize) window.removeEventListener("resize", onWindowResize);
        document.removeEventListener("mousemove", onMouseMove);
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
