import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";
import { prefersReducedMotion } from "../utils/reducedMotion";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  /* The custom cursor is a ring that lags the pointer by design — it eases
     toward the real position every frame, so it is always in motion whenever
     the mouse is. Nothing else depends on it, and no stylesheet sets
     `cursor: none`, so the native pointer is already there to fall back on:
     under reduced motion the component renders nothing at all. */
  const reduced = prefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let hover = false;
    let frame = 0;
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    document.addEventListener("mousemove", onMouseMove);
    frame = requestAnimationFrame(function loop() {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
      }
      frame = requestAnimationFrame(loop);
    });
    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;
      element.addEventListener("mouseover", (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");

          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      });
      element.addEventListener("mouseout", () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      });
    });
    /* The loop and the listener outlived the component before: navigating to
       /play unmounted this and left a rAF chain running gsap.to against a
       detached node once a frame, forever. */
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [reduced]);

  if (reduced) return null;
  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
