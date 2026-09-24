"use client";
import { useEffect, useRef } from "react";

interface Petal {
  type: "petal" | "blossom" | "glow";
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  color: string;
  opacity: number;
  swayAmplitude: number;
  swayFrequency: number;
  swayOffset: number;
}

const PETAL_COLORS = [
  "rgba(255, 142, 168, 0.65)", // Soft rose pink
  "rgba(255, 182, 193, 0.55)", // Cherry blossom light
  "rgba(224, 86, 126, 0.60)",  // Medium rose
  "rgba(194, 52, 90, 0.45)",   // Deep velvet rose
  "rgba(255, 205, 218, 0.70)", // Blush cream
];

export default function FallingPetalsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Fade in when scrolled past hero section
    const handleScroll = () => {
      if (!wrapper) return;
      const scrollY = window.scrollY;
      const heroThreshold = window.innerHeight * 0.4;
      const fadeRange = window.innerHeight * 0.4;
      const opacity = Math.min(1, Math.max(0, (scrollY - heroThreshold) / fadeRange));
      wrapper.style.opacity = opacity.toString();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // ── Generate Petals & Blossoms ──────────────────────────────────────────
    const PETAL_COUNT = Math.min(48, Math.floor(window.innerWidth / 28));
    const petals: Petal[] = [];

    for (let i = 0; i < PETAL_COUNT; i++) {
      const isBlossom = i % 8 === 0;
      const isGlow = i % 6 === 0;

      petals.push({
        type: isBlossom ? "blossom" : isGlow ? "glow" : "petal",
        x: Math.random() * width,
        y: Math.random() * height,
        size: isBlossom ? Math.random() * 5 + 7 : isGlow ? Math.random() * 3 + 2 : Math.random() * 9 + 8,
        speedY: Math.random() * 0.8 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: Math.random() * 0.03 + 0.01,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        opacity: Math.random() * 0.4 + 0.35,
        swayAmplitude: Math.random() * 1.6 + 0.8,
        swayFrequency: Math.random() * 0.015 + 0.008,
        swayOffset: Math.random() * 1000,
      });
    }

    // ── Render Loop ────────────────────────────────────────────────────────
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Motion physics
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(tick * p.swayFrequency + p.swayOffset) * p.swayAmplitude;

        // Wrap around viewport edges
        if (p.y > height + 30) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === "petal") {
          // 3D tumbling petal
          const scaleY = Math.cos(p.flip);
          ctx.scale(1, scaleY);

          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(
            p.size * 0.85, -p.size * 0.4,
            p.size * 0.75, p.size * 0.8,
            0, p.size
          );
          ctx.bezierCurveTo(
            -p.size * 0.75, p.size * 0.8,
            -p.size * 0.85, -p.size * 0.4,
            0, -p.size
          );
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();

          // Subtle central vein highlight
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.7);
          ctx.lineTo(0, p.size * 0.7);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 0.8;
          ctx.stroke();

        } else if (p.type === "blossom") {
          // Little 5-petal flower icon
          ctx.globalAlpha = p.opacity * 0.9;
          const petalRadius = p.size * 0.55;
          ctx.fillStyle = "#ffaab8";

          for (let petalIdx = 0; petalIdx < 5; petalIdx++) {
            const angle = (petalIdx * Math.PI * 2) / 5;
            const px = Math.cos(angle) * petalRadius;
            const py = Math.sin(angle) * petalRadius;
            ctx.beginPath();
            ctx.arc(px, py, petalRadius * 0.75, 0, Math.PI * 2);
            ctx.fill();
          }

          // Center yellow/gold dot
          ctx.beginPath();
          ctx.arc(0, 0, petalRadius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = "#ffe082";
          ctx.fill();

        } else if (p.type === "glow") {
          // Soft glowing sparkle orb
          const pulse = Math.sin(tick * 0.04 + p.swayOffset) * 0.3 + 0.7;
          ctx.globalAlpha = p.opacity * pulse;
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
          gradient.addColorStop(0, "rgba(255, 182, 193, 0.9)");
          gradient.addColorStop(0.5, "rgba(255, 107, 138, 0.4)");
          gradient.addColorStop(1, "rgba(255, 107, 138, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 pointer-events-none z-[4] transition-opacity duration-700 overflow-hidden"
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
