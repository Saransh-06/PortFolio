import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

/* Reused so the guard below doesn't allocate on every observer callback. */
const measured = new THREE.Vector2();

/* Match the renderer and camera to the stage's current box. Cheap, idempotent,
   and — importantly — it touches no ScrollTriggers, so it is safe to call from
   a ResizeObserver.

   Returns true if the stage actually moved.

   This exists separately from handleResize() below because the stage can change
   size without the window changing: the page mounts short enough to have no
   scrollbar, content arrives, a 15px scrollbar appears and the stage narrows.
   A `resize` listener never hears about that, so the canvas kept its mount-time
   inline width, overhung its container by the width of the scrollbar, and drew
   the figure half a scrollbar right of the page's centre — which the role lines
   beside it are positioned against (see the clearance note in Landing.css). */
export function resizeStage(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>
) {
  if (!canvasDiv.current) return false;
  const canvas3d = canvasDiv.current.getBoundingClientRect();
  const width = canvas3d.width;
  const height = canvas3d.height;

  /* Below 769px `.character-model` is `display: none`, which reports 0x0.
     Resizing to that would divide by zero in the aspect below. */
  if (width < 1 || height < 1) return false;

  renderer.getSize(measured);
  if (Math.abs(measured.x - width) < 0.5 && Math.abs(measured.y - height) < 0.5) {
    return false;
  }

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  return true;
}

/* The full window-resize path: re-size the stage, then rebuild the scroll
   timelines against the new geometry.

   Only ever call this from a `resize` listener. It kills every ScrollTrigger on
   the page and rebuilds only the character timelines and the career one, so
   everything else that owns a trigger — the text reveals in splitText.ts, the
   tech stack, the CTA — is destroyed and not recreated. That is survivable as a
   one-off cost when someone drags a window edge. It is not survivable on a
   layout reflow, which is why the scrollbar case above resizes the stage and
   stops there. */
export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>,
  character: THREE.Object3D
) {
  if (!resizeStage(renderer, camera, canvasDiv)) return;

  const workTrigger = ScrollTrigger.getById("work");
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger != workTrigger) {
      trigger.kill();
    }
  });
  setCharTimeline(character, camera);
  setAllTimeline();
}
