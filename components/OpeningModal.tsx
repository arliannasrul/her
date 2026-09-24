"use client";
import { useRef, useState, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Heart } from "lucide-react";
import { startLenis } from "@/lib/lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const NO_COPIES = [
  "Eits, ga bisa, Bae! 😜",
  "Yakin nih mau klik No, Amelia? 🥺",
  "Tombol ini rusak, pencet Yes aja, Bae ❤️",
  "Gabisa kabur dari cintaku wkwk",
  "Coba lagi kalau bisa, Amelia 😝",
  "Pilihanmu cuma YES, Bae! 🥰",
  "Mustahil diklik kan? Hehe 💕",
  "Udah, pencet Yess aja yuk, Bae~ 🌹",
];

const HEART_COLORS = ["#ff6b8a", "#c2345a", "#ff8da1", "#d4a843", "#ffffff", "#ff4d6d", "#ff3366", "#f72585"];
const SVG_HEART = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

function triggerLoveCelebration(buttonRect?: DOMRect) {
  if (typeof window === "undefined") return;

  const centerX = buttonRect ? buttonRect.left + buttonRect.width / 2 : window.innerWidth / 2;
  const centerY = buttonRect ? buttonRect.top + buttonRect.height / 2 : window.innerHeight / 2;

  // Single container for all celebration particles to avoid reflows
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;";
  const fragment = document.createDocumentFragment();

  // 1. Radial explosion from the button (58 vector hearts)
  const burstCount = 58;
  for (let i = 0; i < burstCount; i++) {
    const el = document.createElement("div");
    const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    const size = Math.random() * 20 + 16; // 16px to 36px
    el.innerHTML = SVG_HEART;
    el.style.cssText = `
      position: absolute;
      left: ${centerX}px;
      top: ${centerY}px;
      width: ${size}px;
      height: ${size}px;
      color: ${color};
      user-select: none;
      transform: translate(-50%, -50%) scale(0);
      will-change: transform, opacity;
      filter: drop-shadow(0 0 8px ${color});
    `;
    fragment.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.55 + 75;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - (Math.random() * 110 + 25);
    const duration = Math.random() * 0.6 + 0.9;
    const delay = Math.random() * 0.12;

    gsap.timeline({ delay })
      .to(el, {
        scale: Math.random() * 0.6 + 0.9,
        duration: 0.16,
        ease: "back.out(2)",
      })
      .to(el, {
        x: destX,
        y: destY,
        rotation: (Math.random() - 0.5) * 260,
        duration: duration,
        ease: "power2.out",
      }, 0)
      .to(el, {
        opacity: 0,
        scale: 0.25,
        duration: 0.38,
        ease: "power1.in",
      }, duration - 0.38);
  }

  // 2. Rising love stream (42 vector hearts)
  const streamCount = 42;
  for (let i = 0; i < streamCount; i++) {
    const el = document.createElement("div");
    const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + Math.random() * 50;
    const size = Math.random() * 22 + 16;
    el.innerHTML = SVG_HEART;
    el.style.cssText = `
      position: absolute;
      left: ${startX}px;
      top: ${startY}px;
      width: ${size}px;
      height: ${size}px;
      color: ${color};
      user-select: none;
      transform: translate(-50%, 0) scale(0);
      will-change: transform, opacity;
      filter: drop-shadow(0 0 8px ${color});
    `;
    fragment.appendChild(el);

    const travelY = -(window.innerHeight + Math.random() * 180 + 80);
    const driftX = (Math.random() - 0.5) * 180;
    const duration = Math.random() * 0.8 + 1.3;
    const delay = Math.random() * 0.35;

    gsap.timeline({ delay })
      .to(el, {
        scale: Math.random() * 0.5 + 0.8,
        opacity: 1,
        duration: 0.22,
        ease: "power1.out",
      })
      .to(el, {
        y: travelY,
        x: driftX,
        rotation: (Math.random() - 0.5) * 160,
        duration: duration,
        ease: "power1.out",
      }, 0)
      .to(el, {
        opacity: 0,
        scale: 0.2,
        duration: 0.45,
      }, duration - 0.45);
  }

  container.appendChild(fragment);
  document.body.appendChild(container);

  setTimeout(() => {
    container.remove();
  }, 2600);
}

interface Props {
  onDone: () => void;
}

export default function OpeningModal({ onDone }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const noRef        = useRef<HTMLButtonElement>(null);
  const yesBtnRef    = useRef<HTMLButtonElement>(null);
  const copyRef      = useRef<HTMLParagraphElement>(null);

  const escapeCount  = useRef(0);
  const yesScaleRef  = useRef(1);

  // ── Entrance ────────────────────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { scale: 0.8, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
    );
  }, { scope: containerRef });

  // ── Infinite No escape logic (loops infinitely, impossible to click!) ──
  const escapeNo = useCallback(() => {
    const el = noRef.current;
    if (!el) return;

    escapeCount.current += 1;
    const idx = (escapeCount.current - 1) % NO_COPIES.length;

    // Gently grow Yes button
    yesScaleRef.current = Math.min(yesScaleRef.current + 0.04, 1.35);
    if (yesBtnRef.current) {
      gsap.to(yesBtnRef.current, {
        scale: yesScaleRef.current,
        duration: 0.25,
        ease: "back.out(2)",
      });
    }

    // Viewport boundaries for translation from center
    const maxRangeX = Math.max(160, (typeof window !== "undefined" ? window.innerWidth / 2 : 600) - 90);
    const maxRangeY = Math.max(130, (typeof window !== "undefined" ? window.innerHeight / 2 : 400) - 80);

    // Pick random location avoiding staying near center
    const signX = Math.random() > 0.5 ? 1 : -1;
    const signY = Math.random() > 0.5 ? 1 : -1;
    const newX = signX * (Math.random() * (maxRangeX - 100) + 100);
    const newY = signY * (Math.random() * (maxRangeY - 80) + 80);

    // Translate button quickly across the screen
    gsap.to(el, {
      x: newX,
      y: newY,
      rotation: (Math.random() - 0.5) * 24,
      duration: 0.22,
      ease: "power2.out",
    });

    // Teasing floating text
    const copy = copyRef.current;
    if (copy) {
      copy.textContent = NO_COPIES[idx];
      gsap.fromTo(copy, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.2 });
      gsap.to(copy, { opacity: 0, duration: 0.3, delay: 1.5 });
    }
  }, []);

  // ── Yes handler ──────────────────────────────────────────────────
  const handleYes = useCallback(() => {
    const rect = yesBtnRef.current?.getBoundingClientRect();

    // Burst pulse on Yes button
    gsap.to(yesBtnRef.current, { scale: yesScaleRef.current * 1.25, duration: 0.15, yoyo: true, repeat: 1 });

    // 💖 EXPLOSION OF HEARTS (100+ love particles berhamburan!)
    triggerLoveCelebration(rect);

    // Trigger romantic music upon user gesture
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("start-romantic-music"));
    }

    // Cinematic modal exit with slight delay to enjoy the explosion
    const container = containerRef.current;
    if (container) container.style.pointerEvents = "none"; // unblock touch immediately
    gsap.to(container, {
      scale: 1.08,
      opacity: 0,
      duration: 0.7,
      delay: 0.45,
      ease: "power2.inOut",
      onComplete: () => {
        // Kick off Lenis + Hero entrance
        startLenis();
        ScrollTrigger.refresh();
        onDone();
      },
    });
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(13,10,14,0.97)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ width: 480, height: 480, background: "radial-gradient(circle, #c2345a 0%, transparent 70%)" }}
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="glass rounded-3xl p-10 flex flex-col items-center gap-6 text-center relative"
        style={{ maxWidth: 420, width: "90vw", opacity: 0 }}
      >
        {/* Floating deco */}
        <span
          className="absolute text-rose-400 pointer-events-none select-none animate-bounce"
          style={{ top: "8%", left: "10%", animationDuration: "2s" }}
        >
          <Heart className="w-5 h-5 fill-rose-400/40" />
        </span>

        <span
          className="absolute text-rose-300 pointer-events-none select-none animate-bounce"
          style={{ top: "6%", left: "48%", animationDuration: "1.9s", animationDelay: "0.6s" }}
        >
          <Heart className="w-4 h-4 fill-rose-300/40" />
        </span>

        <div
          className="p-3.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(194,52,90,0.2), rgba(139,26,62,0.4))",
            border: "1px solid var(--border-rose)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <Heart className="w-12 h-12 text-rose-400 fill-rose-500/80 drop-shadow-[0_0_16px_rgba(255,107,138,0.7)]" />
        </div>

        <h1
          className="text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Do you love me, Bae?
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          answer honestly please...
        </p>

        {/* Buttons side-by-side initially! */}
        <div className="flex items-center justify-center gap-4 w-full relative">
          {/* YES */}
          <button
            ref={yesBtnRef}
            id="btn-yes"
            onClick={handleYes}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-lg text-white glow-rose cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-xl"
            style={{
              background: "linear-gradient(135deg, var(--rose-mid), var(--rose-dark))",
              fontFamily: "var(--font-body)",
              transformOrigin: "center",
            }}
          >
            <span>Yess</span>
            <Heart className="w-5 h-5 fill-current text-rose-200" />
          </button>

          {/* NO — Placed directly beside YES initially, then breaks free into fixed positioning on hover */}
          <button
            ref={noRef}
            id="btn-no"
            className="px-6 py-3.5 rounded-2xl font-medium text-base border cursor-pointer select-none transition-colors"
            style={{
              borderColor: "var(--border-rose)",
              color: "var(--text-muted)",
              background: "rgba(255, 255, 255, 0.06)",
              fontFamily: "var(--font-body)",
              zIndex: 9999,
              minWidth: 84,
            }}
            onMouseEnter={escapeNo}
            onTouchStart={(e) => { e.preventDefault(); escapeNo(); }}
            onPointerDown={(e) => { e.preventDefault(); escapeNo(); }}
            onClick={(e) => { e.preventDefault(); escapeNo(); }}
          >
            No
          </button>
        </div>

        {/* Teasing message below */}
        <p
          ref={copyRef}
          className="text-sm absolute -bottom-10 left-0 right-0 text-center opacity-0 font-medium"
          style={{ color: "var(--rose-light)" }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
