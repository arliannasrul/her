"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate for mouse/pointer devices
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cur = cursorRef.current;
    const trail = trailRef.current;
    if (!cur || !trail) return;

    gsap.set(cur, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(trail, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xCur = gsap.quickTo(cur, "x", { duration: 0.12, ease: "power3" });
    const yCur = gsap.quickTo(cur, "y", { duration: 0.12, ease: "power3" });
    const xTrail = gsap.quickTo(trail, "x", { duration: 0.45, ease: "power3" });
    const yTrail = gsap.quickTo(trail, "y", { duration: 0.45, ease: "power3" });

    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        gsap.to([cur, trail], { opacity: 1, duration: 0.2 });
      }
      xCur(e.clientX);
      yCur(e.clientY);
      xTrail(e.clientX);
      yTrail(e.clientY);
    };

    // Grow cursor on any interactive elements (buttons, links, inputs, cards)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = target.closest("button, a, input, [role='button'], .cursor-pointer, .interactive-card");
      if (isInteractive) {
        gsap.to(cur, { scale: 1.8, duration: 0.2, ease: "back.out(2)" });
        gsap.to(trail, { scale: 1.6, opacity: 0.7, duration: 0.2 });
      } else {
        gsap.to(cur, { scale: 1, duration: 0.2, ease: "power2.out" });
        gsap.to(trail, { scale: 1, opacity: 0.45, duration: 0.2 });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Floating glowing heart cursor */}
      <div
        ref={cursorRef}
        id="custom-cursor"
        className="hidden md:block fixed top-0 left-0 pointer-events-none select-none z-[100000]"
        style={{ width: 24, height: 24 }}
        aria-hidden="true"
      >
        <span
          style={{
            fontSize: 18,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 0 8px rgba(255, 107, 138, 0.9))",
          }}
        >
          🤍
        </span>
      </div>

      {/* Smooth trailing glow */}
      <div
        ref={trailRef}
        id="cursor-trail"
        className="hidden md:block fixed top-0 left-0 pointer-events-none select-none z-[99999] rounded-full"
        style={{
          width: 10,
          height: 10,
          background: "var(--rose-mid)",
          opacity: 0,
          filter: "blur(1px)",
          boxShadow: "0 0 10px var(--rose-glow)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
