"use client";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { X, ZoomIn, Heart } from "lucide-react";
import { HER_PHOTOS } from "@/lib/photos";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface HerPhoto {
  id: number;
  url: string;
  caption: string;
  alt: string;
  position?: string;
}

// Floating decorative petals/sparkles in background
const PETALS = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  left: `${(i * 17) % 96 + 2}%`,
  top: `${(i * 23) % 94 + 3}%`,
  size: (i % 3) * 4 + 6,
  delay: (i * 0.4) % 4,
  duration: 4 + (i % 4),
  opacity: 0.25 + ((i % 4) * 0.15),
}));

export default function HerGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<HerPhoto | null>(null);

  // GSAP Entrance animation
  useGSAP(() => {
    const cards = sectionRef.current?.querySelectorAll(".her-photo-card");
    if (cards?.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 35, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section
      id="her-gallery"
      ref={sectionRef}
      className="relative py-28 px-4 md:px-8 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0e0911 0%, #150d1a 50%, #0e0911 100%)",
      }}
    >
      {/* Floating Petal particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PETALS.map((petal) => (
          <div
            key={petal.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: petal.left,
              top: petal.top,
              width: petal.size,
              height: petal.size,
              background: petal.id % 2 === 0 ? "rgba(255, 107, 138, 0.4)" : "rgba(255, 182, 193, 0.3)",
              boxShadow: "0 0 10px rgba(255, 107, 138, 0.4)",
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
              opacity: petal.opacity,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header (Matching Reference Screenshot) */}
        <div className="text-center mb-16">
          <p
            className="italic text-rose-300/80 font-serif tracking-[0.2em] text-sm sm:text-base mb-2"
            style={{ textShadow: "0 0 15px rgba(255, 107, 138, 0.3)" }}
          >
            captured in time
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Beautiful{" "}
            <span
              className="italic font-serif block sm:inline mt-1 sm:mt-0"
              style={{
                color: "#ff8ea8",
                textShadow: "0 0 25px rgba(255, 142, 168, 0.45)",
              }}
            >
              Pictures
            </span>
          </h2>
        </div>

        {/* Photo Grid (2 Kolom: 2 Atas & 2 Kebawah agar ukuran foto jauh lebih besar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {HER_PHOTOS.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="her-photo-card group relative cursor-pointer glass rounded-[28px] p-3 sm:p-4.5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(194,52,90,0.35)] border border-white/10 hover:border-rose-400/40 bg-[#160d1a]/85"
            >
              {/* Photo Image Container */}
              <div className="relative aspect-square w-full rounded-[22px] overflow-hidden bg-black/50">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  style={{ objectPosition: photo.position || "center 15%" }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                />

                {/* Hover overlay sheen + zoom icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs bg-black/70 text-rose-200 backdrop-blur-md border border-rose-500/30">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View photo</span>
                  </span>
                </div>
              </div>

              {/* Simple romantic caption under photo */}
              <div className="pt-4 pb-1 text-center">
                <p className="italic font-serif text-lg sm:text-xl text-rose-200/90 tracking-wider group-hover:text-white transition-colors">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full glass rounded-[28px] p-3 sm:p-4 border border-rose-500/30 bg-[#130b18]/95 overflow-hidden shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-rose-900/60 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              aria-label="Close photo"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Image - Displays full photo without cropping */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-[22px] overflow-hidden bg-black/60 p-1">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.alt}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Modal Caption */}
            <div className="pt-4 pb-2 text-center flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <p className="italic font-serif text-xl sm:text-2xl text-rose-200 tracking-wider">
                {selectedPhoto.caption}
              </p>
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
