"use client";
import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Heart, Camera, ChevronDown } from "lucide-react";
import Ballpit from "./Ballpit";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [ballCount, setBallCount] = useState(35);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setBallCount(mobile ? 35 : 120);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Hero entrance animation ─────────────────────────────────────
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-badge",    { opacity: 0, y: 20, duration: 0.6 })
      .from(".hero-title",    { opacity: 0, y: 35, duration: 0.8 }, "-=0.3")
      .from(".hero-subtitle", { opacity: 0, y: 25, duration: 0.7 }, "-=0.4")
      .from(".hero-ctas",     { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
      .from(".hero-scroll",   { opacity: 0, duration: 0.5 }, "-=0.2");
  }, { scope: sectionRef });

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg,#0d0a0e 0%,#1a0a18 50%,#0d0a0e 100%)" }}
    >
      {/* 3D Ballpit interactive background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none md:pointer-events-auto">
        <Ballpit
          key={ballCount}
          count={ballCount}
          gravity={0}
          friction={0.9975}
          wallBounce={1}
          followCursor={!isMobile}
          colors={["#c2345a", "#8b1a3e", "#4a1228", "#ff6b8a", "#d4a843", "#f5e6ea"]}
          ambientColor="#ffeef2"
          ambientIntensity={1.2}
          lightIntensity={180}
          materialParams={{
            metalness: 0.35,
            roughness: 0.25,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
          }}
        />
      </div>

      {/* Radial dark scrim / vignette behind content for crystal clear text readability */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[5]">
        <div
          className="w-[850px] h-[650px] max-w-[95vw] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(13, 10, 14, 0.92) 0%, rgba(13, 10, 14, 0.72) 50%, rgba(13, 10, 14, 0) 80%)",
            filter: "blur(24px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl py-6">
        <div className="hero-badge mb-6 flex justify-center">
          <span
            className="inline-flex items-center text-xs sm:text-sm uppercase tracking-[0.25em] px-5 py-2 rounded-full border shadow-xl backdrop-blur-md"
            style={{
              borderColor: "var(--border-rose)",
              color: "var(--gold)",
              background: "rgba(26, 10, 24, 0.8)",
            }}
          >
            Written Just For You • Happy Birthday!
          </span>
        </div>

        <h1
          className="hero-title text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
          style={{
            fontFamily: "var(--font-display)",
            color: "#ffffff",
            textShadow: "0 4px 30px rgba(0,0,0,0.9), 0 0 40px rgba(194,52,90,0.3)",
          }}
        >
          You Brought Color<br />
          <span style={{ color: "var(--rose-light)" }}>Into My Entire World</span>
        </h1>

        <p
          className="hero-subtitle text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-10 mx-auto text-slate-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
          style={{ maxWidth: 560 }}
        >
          In a world that once felt quiet and gray, you walked in and painted every part of my life with warmth, light, and love.
        </p>

        <div className="hero-ctas flex gap-4 justify-center flex-wrap">
          <a
            href="#timeline"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-white glow-rose transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
            style={{ background: "linear-gradient(135deg,var(--rose-mid),var(--rose-dark))" }}
          >
            <Heart className="w-5 h-5 fill-current" />
            <span>Our Story</span>
          </a>
          <a
            href="#gallery"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold border transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
            style={{
              borderColor: "var(--border-rose)",
              color: "var(--text-primary)",
              background: "rgba(26, 16, 32, 0.85)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Camera className="w-5 h-5 text-rose-300" />
            <span>Memory Gallery</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none">
        <p className="text-xs uppercase tracking-widest text-slate-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">scroll</p>
        <ChevronDown className="w-4 h-4 text-rose-300 animate-bounce" />
      </div>
    </section>
  );
}
