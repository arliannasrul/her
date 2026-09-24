"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Gamepad2, Heart } from "lucide-react";
import { TIMELINE_PHOTOS } from "@/lib/photos";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface TimelineEvent {
  id: number;
  image: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isGoldTheme?: boolean;
}

const events: TimelineEvent[] = [
  {
    id: 1,
    image: TIMELINE_PHOTOS.robloxMeeting,
    badge: "From Roblox",
    title: "From Violence District",
    description: "Do you still remember where we first met :D",
    icon: Gamepad2,
    isGoldTheme: true,
  },
  {
    id: 2,
    image: TIMELINE_PHOTOS.firstRealMeeting,
    badge: "first meet",
    title: "The first time we met in real life",
    description: "After nearly a year of being apart, meeting you for the first time in person felt like a dream. I'm so happyy",
    icon: Heart,
    isGoldTheme: false,
  },
];

export default function TimelineSection() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // ── Scroll progress bar + stagger card reveal ────────────────────
  useGSAP(() => {
    // Progress bar
    gsap.fromTo(
      progressRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          end: "bottom 80%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    // Stagger reveal each card
    const cards = sectionRef.current?.querySelectorAll(".timeline-card");
    if (cards?.length) {
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative py-24 px-4 md:px-8 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0d0a0e 0%,#110c18 50%,#0d0a0e 100%)" }}
    >
      {/* Heading */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center text-xs uppercase tracking-[0.25em] mb-3" style={{ color:"var(--gold)" }}>
          <span>Our Journey</span>
        </span>
        <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)" }}>
          How It All Started
        </h2>
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* Track + progress bar */}
        <div
          className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
          style={{ background:"var(--border-rose)" }}
        >
          <div
            ref={progressRef}
            className="w-full rounded-full"
            style={{
              height:"100%", transformOrigin:"top",
              background:"linear-gradient(to bottom,var(--rose-mid),var(--gold))",
              boxShadow:"0 0 8px var(--rose-glow)",
              transform:"scaleY(0)",
            }}
          />
        </div>

        <div className="flex flex-col gap-12">
          {events.map((ev, i) => (
            <div
              key={ev.id}
              className="timeline-card relative flex gap-6 md:gap-0"
            >
              {/* Center Dot Icon */}
              <div
                className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center rounded-full"
                style={{
                  width: 44, height: 44,
                  background: ev.isGoldTheme
                    ? "linear-gradient(135deg,var(--gold),var(--gold-light))"
                    : "linear-gradient(135deg,var(--rose-dark),var(--rose-mid))",
                  boxShadow: ev.isGoldTheme ? "0 0 18px rgba(212,168,67,.6)" : "0 0 14px var(--rose-glow)",
                }}
              >
                <ev.icon className="w-5 h-5 text-white" />
              </div>

              {/* Card Container */}
              <div
                className={`ml-16 md:ml-0 w-full md:w-[calc(50%-3rem)] ${
                  i % 2 === 0 ? "md:mr-auto md:pr-2" : "md:ml-auto md:pl-2"
                }`}
              >
                <div
                  className="glass rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] group"
                  style={{
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                    borderColor: ev.isGoldTheme ? "rgba(212,168,67,0.3)" : "var(--border-rose)",
                  }}
                >
                  {/* Photo / Image */}
                  <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden mb-4 border border-white/10 bg-black/40">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

         

                  {/* Title */}
                  <h3
                    className="text-lg sm:text-xl font-semibold mb-2"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                  >
                    {ev.title}
                  </h3>

                  {/* Clean Description */}
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {ev.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

