"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Heart, MousePointerClick } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function MiniGame() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const envelopeRef  = useRef<HTMLDivElement>(null);
  const flapRef      = useRef<HTMLDivElement>(null);
  const letterRef    = useRef<HTMLDivElement>(null);
  const letterBodyRef= useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [animated, setAnimated] = useState(false);

  // ── Scroll reveal ────────────────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo(
      envelopeRef.current,
      { y: 50, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      }
    );

    // Idle float
    gsap.to(envelopeRef.current, {
      y:-10, duration:2.2, ease:"power1.inOut", yoyo:true, repeat:-1,
    });
  }, { scope: sectionRef });

  // ── Open envelope (click/tap) ────────────────────────────────────
  const openEnvelope = () => {
    if (animated) return;
    setAnimated(true);

    const flap   = flapRef.current;
    const letter = letterRef.current;
    const body   = letterBodyRef.current;
    if (!flap || !letter || !body) return;

    const tl = gsap.timeline({ onComplete: () => setOpened(true) });
    tl
      // Stop the float
      .to(envelopeRef.current, { y:0, duration:0.3, ease:"power2.out" }, 0)
      // Flap rotates open (perspective fold)
      .to(flap, {
        rotationX: -175,
        transformOrigin:"top center",
        duration: 0.65,
        ease:"power2.inOut",
      }, 0.1)
      // Letter slides up out of envelope
      .fromTo(letter,
        { y:20, opacity:0 },
        { y:-90, opacity:1, duration:0.55, ease:"power3.out" },
        "-=0.15"
      )
      // Letter content fades in
      .fromTo(body,
        { opacity:0, y:12 },
        { opacity:1, y:0, duration:0.5, ease:"power2.out" },
        "-=0.1"
      );
  };

  return (
    <section
      id="minigame"
      ref={sectionRef}
      className="py-24 px-4 flex flex-col items-center gap-14 overflow-hidden"
      style={{ background:"linear-gradient(180deg,#0d0a0e 0%,#1a0a18 100%)" }}
    >
      {/* Heading */}
      <div className="text-center">
        <span className="inline-flex items-center text-sm uppercase tracking-[0.3em] mb-4" style={{ color:"var(--gold)" }}>
          <span>Secret Message</span>
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)" }}>
          A Letter For You
        </h2>
        <p style={{ color:"var(--text-muted)", fontSize:"0.9rem" }}>
          {opened ? (
            <span className="inline-flex items-center gap-1.5 text-rose-300">
              <span>opened with love</span>
            </span>
          ) : (
            "click the envelope to open it"
          )}
        </p>
      </div>

      {/* Envelope + Letter */}
      <div
        ref={envelopeRef}
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width:260, height:180, perspective:800 }}
        onClick={openEnvelope}
      >
        {/* Envelope body */}
        <div
          className="absolute inset-0 rounded-2xl glass"
          style={{ background:"linear-gradient(135deg,var(--rose-dark),#2a0f1f)", border:"1.5px solid var(--border-rose)" }}
        >
          {/* Bottom-left & right triangles (decorative V fold) */}
          <div className="absolute bottom-0 left-0 w-0 h-0" style={{
            borderBottom:"90px solid rgba(194,52,90,.18)",
            borderRight:"130px solid transparent",
          }} />
          <div className="absolute bottom-0 right-0 w-0 h-0" style={{
            borderBottom:"90px solid rgba(194,52,90,.18)",
            borderLeft:"130px solid transparent",
          }} />
          {/* Center diamond fold */}
          <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
            <div style={{ width:0, height:0, borderLeft:"130px solid transparent", borderRight:"130px solid transparent",
              borderBottom:"90px solid rgba(194,52,90,.1)" }} />
          </div>
          {/* Wax seal when closed */}
          {!animated && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center glow-rose"
              style={{ background:"linear-gradient(135deg,var(--rose-mid),var(--rose-dark))", zIndex:10 }}
            >
              <Heart className="w-5 h-5 text-rose-200 fill-white/80" />
            </div>
          )}
        </div>

        {/* Flap (top half, folds back on rotationX) */}
        <div
          ref={flapRef}
          className="absolute top-0 left-0 right-0 rounded-t-2xl overflow-hidden"
          style={{
            height:"50%",
            transformOrigin:"top center",
            transformStyle:"preserve-3d",
            background:"linear-gradient(160deg,#3d1129,var(--rose-dark))",
            border:"1.5px solid var(--border-rose)",
            borderBottom:"none",
            zIndex:20,
          }}
        >
          <div className="absolute bottom-0 left-0 w-0 h-0" style={{
            borderTop:"90px solid rgba(139,26,62,.4)",
            borderRight:"130px solid transparent",
          }} />
          <div className="absolute bottom-0 right-0 w-0 h-0" style={{
            borderTop:"90px solid rgba(139,26,62,.4)",
            borderLeft:"130px solid transparent",
          }} />
        </div>

        {/* Letter (hidden inside, GSAP slides it up) */}
        <div
          ref={letterRef}
          className="absolute glass rounded-xl p-5 z-30"
          style={{
            width:"90%", top:"10%",
            opacity:0, y:20,
            border:"1px solid var(--border-rose)",
            background:"linear-gradient(135deg,rgba(26,16,32,.95),rgba(13,10,14,.9))",
          }}
        >
          <div ref={letterBodyRef} className="opacity-0">
            <p className="inline-flex items-center justify-center w-full text-xs uppercase tracking-widest mb-3 text-center" style={{ color:"var(--gold)" }}>
              <span>Secret Message</span>
            </p>
            <p className="text-sm leading-relaxed text-center" style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)" }}>
              "Happy Birthday, Amelia! No matter how many kilometers stand between us, you are my favorite thought every single day, Bae."
            </p>
            <p className="inline-flex items-center justify-center gap-1 w-full text-xs text-center mt-3" style={{ color:"var(--rose-light)" }}>
              <span>— forever yours, for my Bae</span>
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 inline" />
            </p>
          </div>
        </div>

        {/* Click hint */}
        {!animated && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs flex items-center gap-1.5" style={{ color:"var(--text-muted)" }}>
            <MousePointerClick className="w-3.5 h-3.5 text-rose-400" />
            <span>tap to open</span>
          </div>
        )}
      </div>
    </section>
  );
}
