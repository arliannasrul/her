"use client";
import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // On touch/mobile devices, skip Lenis entirely.
    // Lenis registers touchmove with passive:false which blocks native scroll.
    // Native scroll on mobile is already smooth — no need for Lenis.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      // Mobile: wire ScrollTrigger to native scroll only
      window.addEventListener("scroll", () => ScrollTrigger.update(), { passive: true });
      // setLenis(null) so getLenis() returns null — MusicPlayer handles this gracefully
      setLenis(null);
      return () => {
        window.removeEventListener("scroll", () => ScrollTrigger.update());
      };
    }

    // Desktop: use Lenis smooth scroll
    // Dynamic import to avoid loading Lenis bundle on mobile
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        gestureOrientation: "vertical",
      });

      setLenis(lenis);
      lenis.stop(); // paused until opening modal completes

      // Wire Lenis ↔ GSAP ScrollTrigger
      lenis.on("scroll", () => ScrollTrigger.update());

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Cleanup stored so the async return can use it
      (window as unknown as Record<string, unknown>).__lenisCleanup = () => {
        lenis.destroy();
        setLenis(null);
        gsap.ticker.remove(tick);
      };
    });

    return () => {
      const cleanup = (window as unknown as Record<string, unknown>).__lenisCleanup;
      if (typeof cleanup === "function") {
        cleanup();
        delete (window as unknown as Record<string, unknown>).__lenisCleanup;
      }
    };
  }, []);

  return <>{children}</>;
}
