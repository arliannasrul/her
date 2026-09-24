"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLenis } from "@/lib/lenis";
import { DOLLY_PHOTOS } from "@/lib/photos";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface DollyPhoto {
  id: number;
  src: string;
  alt: string;
  side: "left" | "right";
}

const GALLERY_PHOTOS: DollyPhoto[] = DOLLY_PHOTOS;

export default function DollyGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const mouseTilt = useRef({ x: 0, y: 0 });

  const total = GALLERY_PHOTOS.length;
  const SPACING = 620; // Z-axis distance between consecutive photos

  // ── 3D Dolly Transform Calculation ──────────────────────────────
  const updateCardTransforms = useCallback(
    (progressVal: number) => {
      // Current camera position along the Z tunnel
      const currentCameraZ = progressVal * (total - 1) * SPACING;
      const currentFloatIdx = progressVal * (total - 1);
      const roundedIdx = Math.min(total - 1, Math.max(0, Math.round(currentFloatIdx)));
      setActiveIndex(roundedIdx);

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const photo = GALLERY_PHOTOS[i];
        const isLeft = photo.side === "left";

        // Base Z position along the corridor
        const baseZ = -i * SPACING;
        const relativeZ = baseZ + currentCameraZ;

        let opacity = 0;
        let scale = 1;
        let blurVal = 0;
        let xSlide = 0;
        let yOffset = isLeft ? -15 : 25; // Subtle natural vertical stagger

        if (relativeZ < -1800) {
          // Deep in the fog (hidden)
          opacity = 0;
          scale = 0.35;
          blurVal = 14;
        } else if (relativeZ < 0) {
          // Approaching the camera from the depth
          const norm = (relativeZ + 1800) / 1800; // 0 to 1
          opacity = Math.pow(norm, 1.6);
          scale = 0.4 + 0.6 * norm;
          blurVal = (1 - norm) * 10;
          yOffset += (1 - norm) * 35;
        } else if (relativeZ <= 380) {
          // Slipping past the camera lens into the foreground
          const norm = relativeZ / 380; // 0 to 1
          opacity = Math.max(0, 1 - Math.pow(norm, 1.3));
          scale = 1.0 + 0.42 * norm;
          blurVal = norm * 6;
          // As it slips past the lens, push outward left/right for dramatic immersion
          xSlide = (isLeft ? -1 : 1) * norm * 70;
          yOffset += (isLeft ? -1 : 1) * norm * 20;
        } else {
          // Past the camera lens
          opacity = 0;
          scale = 1.6;
        }

        // Mouse interactive parallax
        const depthFactor = Math.max(0.2, 1 - Math.abs(relativeZ) / 1600);
        const tiltX = mouseTilt.current.y * -8 * depthFactor;
        const tiltY = mouseTilt.current.x * 10 * depthFactor;

        // Base horizontal position: Left side (-28vw on desktop) or Right side (+28vw)
        const basePercentX = isLeft ? -52 : 52;
        const baseRotY = isLeft ? 5 : -5;
        const baseRotZ = isLeft ? -1.8 : 1.8;

        card.style.transform = `
          translate3d(calc(${basePercentX}% + ${xSlide}px), ${yOffset}px, ${relativeZ}px)
          rotateX(${tiltX}deg)
          rotateY(${baseRotY + tiltY}deg)
          rotateZ(${baseRotZ}deg)
          scale(${scale})
        `;
        card.style.opacity = String(opacity);
        card.style.filter = blurVal > 0.3 ? `blur(${blurVal.toFixed(1)}px)` : "none";
        card.style.zIndex = String(Math.round(100 - Math.abs(relativeZ)));
        card.style.pointerEvents = Math.abs(relativeZ) < 300 ? "auto" : "none";
      });
    },
    [total]
  );

  // ── GSAP ScrollTrigger Pinning ──────────────────────────────────
  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${total * 480}`,
      pin: true,
      scrub: 0.85,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        updateCardTransforms(self.progress);
      },
    });

    updateCardTransforms(0);

    return () => {
      st.kill();
    };
  }, { scope: containerRef, dependencies: [updateCardTransforms, total] });

  // ── Mouse movement parallax ──────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      mouseTilt.current.x = normX;
      mouseTilt.current.y = normY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ── Smooth Jump to Specific Photo ────────────────────────────────
  const jumpToIndex = useCallback(
    (targetIdx: number) => {
      const targetProgress = Math.max(0, Math.min(total - 1, targetIdx)) / (total - 1);
      const container = containerRef.current;
      if (!container) return;

      const st = ScrollTrigger.getAll().find((trigger) => trigger.trigger === container);

      if (st) {
        const targetScroll = st.start + targetProgress * (st.end - st.start);
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(targetScroll, { duration: 0.9 });
        } else {
          window.scrollTo({ top: targetScroll, behavior: "smooth" });
        }
      }
    },
    [total]
  );

  const handlePrev = () => {
    if (activeIndex > 0) jumpToIndex(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < total - 1) jumpToIndex(activeIndex + 1);
  };

  return (
    <div
      ref={containerRef}
      id="dolly-gallery"
      className="relative w-full h-screen min-h-[700px] flex flex-col items-center justify-between py-8 px-4 overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #180918 0%, #0d0a0e 70%, #080609 100%)",
      }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none blur-[150px] opacity-20"
        style={{
          background: "radial-gradient(circle, #c2345a 0%, #8b1a3e 50%, transparent 80%)",
        }}
      />

      {/* Header section */}
      <div className="relative z-20 text-center max-w-xl mx-auto pt-2">
  

        <h2
          className="text-4xl md:text-5xl font-bold tracking-tight mb-2 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Every Moment With You
        </h2>

        <p className="text-xs sm:text-sm text-rose-200/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Setiap detik bersamamu selalu jadi kenangan yang paling indah.
        </p>
      </div>

      {/* 3D Dolly Stage Viewport */}
      <div
        className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-auto"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Full-bleed Dolly Photos (Alternating Left & Right) */}
        {GALLERY_PHOTOS.map((photo, idx) => {
          const isLeft = photo.side === "left";

          return (
            <div
              key={photo.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="absolute will-change-transform cursor-pointer"
              style={{
                width: "min(44vw, 440px)",
                aspectRatio: "3 / 4",
                transformStyle: "preserve-3d",
              }}
              onClick={() => jumpToIndex(idx)}
            >
              {/* Image Frame with glowing border & deep shadow */}
              <div
                className="w-full h-full rounded-[26px] overflow-hidden border transition-all duration-300 relative group"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.18)",
                  boxShadow:
                    "0 25px 60px -10px rgba(0, 0, 0, 0.95), 0 0 30px rgba(194, 52, 90, 0.25)",
                  background: "#140a16",
                }}
              >
                {/* Full-color Image */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle glass reflection sheen on edge */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-[26px] opacity-30"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.25), inset 0 0 40px rgba(0,0,0,0.5)",
                  }}
                />

                {/* Minimal subtle badge in corner */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className="text-[11px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase backdrop-blur-md border shadow-lg"
                    style={{
                      background: "rgba(13, 10, 14, 0.75)",
                      color: "var(--gold)",
                      borderColor: "rgba(212, 168, 67, 0.4)",
                    }}
                  >
                    {String(photo.id).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Interactive Dock */}
      <div className="relative z-20 flex flex-col items-center gap-2 pb-4">
        <div
          className="glass rounded-full px-5 py-2.5 flex items-center gap-4 shadow-2xl backdrop-blur-xl border border-[var(--border-rose)]"
          style={{ background: "rgba(22, 13, 26, 0.88)" }}
        >
          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid var(--border-rose)",
              color: "var(--text-primary)",
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {GALLERY_PHOTOS.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpToIndex(i)}
                aria-label={`Jump to photo ${i + 1}`}
                className="transition-all duration-300 rounded-full cursor-pointer"
                style={{
                  width: activeIndex === i ? 22 : 7,
                  height: 7,
                  background:
                    activeIndex === i ? "var(--gold)" : "rgba(255, 255, 255, 0.25)",
                  boxShadow:
                    activeIndex === i ? "0 0 10px rgba(212, 168, 67, 0.6)" : "none",
                }}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={activeIndex === total - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid var(--border-rose)",
              color: "var(--text-primary)",
            }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Counter pill */}
          <span
            className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(194, 52, 90, 0.25)",
              color: "var(--rose-light)",
            }}
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
