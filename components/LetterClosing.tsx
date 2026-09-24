"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Heart, Copy, Check, MessageCircle, X } from "lucide-react";
import { WHATSAPP_NUMBER, getWhatsAppMessage } from "@/lib/photos";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const loveMessages = [
  "Happy Birthday to my favorite person in the world! 🎂",
  "Sending you the biggest birthday hug across 300+ km ❤️",
  "Distance means so little when you mean so much",
  "May all your dreams and wishes come true this year ✨",
  "I am endlessly grateful that you were born 💕",
  "Even from afar, my heart is always right beside you",
  "Can't wait to see you soon and celebrate properly! 🌹",
  "Happy Birthday, my love — I love you forever and always",
];

export interface RewardTier {
  clicks: number;
  title: string;
  desc: string;
  code: string;
  badge: string;
}

export const REWARD_TIERS: RewardTier[] = [
  {
    clicks: 10,
    title: "Pelukan Hangat Dari Aku",
    desc: "Karena kamu udah berkali-kali mencet love... ini ada pelukan paling erat dan hangat saat kita ketemu nanti. Boleh kamu klaim kapan aja tanpa batas.",
    code: "HUG-AMELIA-10",
    badge: "10 Clicks Secret Gift",
  },
  {
    clicks: 20,
    title: "Ciuman Manis Dari Aku",
    desc: "Ciuman manis dan penuh sayang di kening atau pipi khusus untuk Amelia, ditabung buat hari bahagia kita pas ketemu nanti.",
    code: "KISS-BAE-20",
    badge: "20 Clicks Secret Gift",
  },
  {
    clicks: 30,
    title: "Hadiah Robux Buat Kamu",
    desc: "Hadiah Robux spesial buat Bae biar avatar Roblox kamu makin cantik & kita bisa seru-seruan bareng lagi di game!",
    code: "ROBUX-AMELIA-30",
    badge: "30 Clicks Secret Gift",
  },
  {
    clicks: 50,
    title: "Gift Discord Decoration",
    desc: "Avatar decoration Discord eksklusif pilihan kamu biar profil Discord Amelia makin estetik, lucu, dan gemas!",
    code: "DISCORD-DECO-50",
    badge: "50 Clicks Secret Gift",
  },
];

const CONFETTI_COLORS = ["#ff6b8a","#c2345a","#d4a843","#f5e6ea","#8b1a3e","#f0c96e","#ff9eb5"];
const SVG_HEART = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

function burst(x: number, y: number, extraPower = false) {
  const count = extraPower ? 70 : 35;
  const heartCount = extraPower ? 25 : 14;

  // Confetti
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `left:${x}px;top:${y}px;background:${CONFETTI_COLORS[i%CONFETTI_COLORS.length]};border-radius:${Math.random()>.5?"50%":"2px"}`;
    document.body.appendChild(el);
    gsap.to(el, {
      x: (Math.random()-.5)*(extraPower ? 350 : 220),
      y: (extraPower ? -140 : -80) - Math.random()*(extraPower ? 200 : 130),
      rotation: Math.random()*540,
      opacity:0, scale: Math.random()*.8+.3,
      duration: (extraPower ? 1.6 : 1.2)+Math.random()*.5,
      ease:"power2.out",
      onComplete: () => el.remove(),
    });
  }
  // Hearts
  for (let i = 0; i < heartCount; i++) {
    const el = document.createElement("div");
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size = Math.random() * 14 + 16;
    el.innerHTML = SVG_HEART;
    el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:${size}px;height:${size}px;left:${x}px;top:${y}px;color:${color};user-select:none;filter:drop-shadow(0 0 6px ${color});`;
    document.body.appendChild(el);
    gsap.to(el, {
      x: (Math.random()-.5)*(extraPower ? 260 : 160),
      y: (extraPower ? -160 : -100)-Math.random()*(extraPower ? 160 : 100),
      rotation: (Math.random()-.5)*60,
      opacity:0, scale:.3,
      duration: (extraPower ? 1.4 : 1)+Math.random()*.6,
      ease:"power2.out",
      onComplete: () => el.remove(),
    });
  }
}

export default function LetterClosing() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const btnRef       = useRef<HTMLButtonElement>(null);
  const msgRef       = useRef<HTMLDivElement>(null);
  const counterRef   = useRef<HTMLSpanElement>(null);
  const countObj     = useRef({ val: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [msgText, setMsgText] = useState("");
  const [activeModalTier, setActiveModalTier] = useState<RewardTier | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // ── Letter reveal ────────────────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo(
      ".letter-card",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      }
    );
    gsap.fromTo(
      btnRef.current,
      { y: 30, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.7)",
        delay: 0.2,
        scrollTrigger: {
          trigger: ".love-btn-area",
          start: "top 90%",
          once: true,
        },
      }
    );

    // Idle pulse on button
    gsap.to(btnRef.current, {
      boxShadow: "0 0 50px rgba(194,52,90,.7), 0 0 100px rgba(139,26,62,.3)",
      duration: 1.4,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, { scope: sectionRef });

  const createWhatsAppUrl = (tier: RewardTier) => {
    const text = getWhatsAppMessage({
      clicks: tier.clicks,
      title: tier.title,
      code: tier.code,
    });
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handleLove = (e: React.MouseEvent) => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Check if newCount hits any milestone
    const unlockedTier = REWARD_TIERS.find((tier) => tier.clicks === newCount);
    if (unlockedTier) {
      setActiveModalTier(unlockedTier);
      burst(window.innerWidth / 2, window.innerHeight / 2, true);
    }

    // Rolling counter
    gsap.to(countObj.current, {
      val: newCount, duration:0.4, ease:"power2.out",
      onUpdate: () => {
        if (counterRef.current)
          counterRef.current.textContent = String(Math.round(countObj.current.val));
      },
    });

    // Button burst
    gsap.to(btnRef.current, { scale:0.88, duration:0.08, yoyo:true, repeat:1,
      onComplete: () => gsap.to(btnRef.current, { scale:1, duration:0.2, ease:"back.out(2)" }),
    });

    // Message swap with GSAP
    const msg = loveMessages[Math.floor(Math.random()*loveMessages.length)];
    setMsgText(msg);
    const el = msgRef.current;
    if (el) {
      gsap.fromTo(el, { opacity:0, y:10, scale:.9 }, { opacity:1, y:0, scale:1, duration:.35, ease:"back.out(1.7)" });
      gsap.to(el, { opacity:0, duration:.35, delay:2.2 });
    }

    burst(e.clientX, e.clientY);
  };

  return (
    <section
      id="closing"
      ref={sectionRef}
      className="py-24 px-4 md:px-8 flex flex-col items-center gap-16 overflow-hidden"
      style={{ background:"linear-gradient(180deg,#0d0a0e 0%,#1a0a18 60%,#0d0a0e 100%)" }}
    >
      {/* Letter */}
      <div className="letter-card max-w-2xl w-full">
        <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden" style={{ borderColor:"var(--border-rose)" }}>
          {Array.from({ length:8 }).map((_,i) => (
            <div key={i} className="absolute left-0 right-0 opacity-5" style={{ top:80+i*40, height:1, background:"var(--text-primary)" }} />
          ))}
          <div className="relative z-10">
            <span className="inline-flex items-center justify-center text-sm uppercase tracking-[0.3em] mb-6 w-full text-center" style={{ color:"var(--gold)" }}>
              <span>A Birthday Letter For You</span>
            </span>
            <div className="space-y-5 leading-relaxed" style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)", fontSize:"1.05rem" }}>
              <p>To Amelia, my dearest bae,</p>
              <p>
                <em style={{ color:"var(--rose-light)" }}>Happy Birthday, Bae. 🎂</em>
              </p>
              <p>
                I wish so deeply that I could be right there beside you today — to hold your hand, see your sweetest smile in person, and blow out the candles together. 
                Even though 300+ km of distance keeps us in different places today, not a single mile could ever lessen how much you mean to me.
              </p>
              <p>
                You might never realize just how much brighter my life has become since you walked into it. Every call, every laugh, and every little story we share across the screen is a memory I treasure with all my heart.
              </p>
              <p>
                On this birthday, I wish you endless joy, peace, and dreams that all come true. 
                300 km is just a number on a map, but in my heart, you are closer than anyone else in this world.
              </p>
              <p style={{ color:"var(--text-muted)" }}>
                Thank you for being born, Amelia, and thank you for being mine.<br />
                Until we close this distance again, I love you more than words could ever tell.
              </p>
              <p className="pt-4" style={{ color:"var(--gold)" }}>
                With all my love across the miles,<br />
                <span className="inline-flex items-center gap-2" style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem" }}>
                  <span>Forever Yours, Bae</span>
                  <Heart className="w-4 h-4 fill-rose-400 text-rose-400 inline" />
                </span>
              </p>
            </div>
          </div>
          <Heart className="absolute bottom-4 right-6 w-16 h-16 opacity-10 text-rose-400 fill-current pointer-events-none" />
        </div>
      </div>

      {/* "I Love You" Button Area */}
      <div className="love-btn-area flex flex-col items-center gap-6">
        <div className="relative flex flex-col items-center">
          <button
            ref={btnRef}
            id="love-btn"
            onClick={handleLove}
            className="inline-flex items-center gap-2.5 px-12 py-5 rounded-3xl text-xl font-bold text-white glow-rose cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-2xl"
            style={{
              background:"linear-gradient(135deg,var(--rose-mid),var(--rose-dark))",
              fontFamily:"var(--font-display)",
            }}
          >
            <Heart className="w-6 h-6 fill-current text-white" />
            <span>I Love You</span>
          </button>

          {/* Popup message */}
          <div
            ref={msgRef}
            className="absolute -top-16 left-1/2 -translate-x-1/2 glass rounded-2xl px-5 py-2.5 text-sm text-center pointer-events-none"
            style={{ color:"var(--text-primary)", opacity:0, whiteSpace:"nowrap", minWidth:280 }}
          >
            {msgText}
          </div>
        </div>

        {/* Rolling counter */}
        <p className="text-sm" style={{ color:"var(--text-muted)" }}>
          {clickCount===0
            ? "klik tombol di atas ❤️"
            : <>diklik <span ref={counterRef} className="font-bold" style={{ color:"var(--rose-light)" }}>{clickCount}</span> kali</>
          }
        </p>
      </div>

      {/* ── ROMANTIC SECRET GIFT CARD MODAL ───────────── */}
      {activeModalTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div
            className="rounded-3xl p-7 sm:p-9 max-w-md w-full relative text-center flex flex-col items-center border border-rose-500/20 shadow-2xl overflow-hidden"
            style={{
              background: "radial-gradient(circle at 50% 0%, #240c1e 0%, #0e040d 100%)",
              boxShadow: "0 20px 50px -10px rgba(194, 52, 90, 0.3), 0 0 30px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalTier(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-rose-200/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Subtle romantic tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] uppercase tracking-[0.2em] mb-4">
              <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
              <span>A Secret Gift For Bae</span>
            </div>

            {/* Title */}
            <h3
              className="text-2xl sm:text-3xl font-medium text-white mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {activeModalTier.title}
            </h3>

            {/* Loving message */}
            <p className="text-xs sm:text-sm text-rose-100/75 leading-relaxed font-light max-w-sm mb-6">
              &ldquo;{activeModalTier.desc}&rdquo;
            </p>

            {/* Keepsake Pass / Love Coupon */}
            <div
              className="w-full rounded-2xl p-4 mb-6 relative text-left border border-rose-400/20"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
              }}
            >
              <div className="flex items-center justify-between text-[10px] text-rose-200/60 uppercase tracking-[0.2em] mb-2 font-mono">
                <span>VOUCHER CODE</span>
                <span className="text-amber-300/80 font-sans tracking-normal">Valid Forever • For Bae</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-base sm:text-lg font-mono font-semibold tracking-wider text-amber-200 selection:bg-rose-500/30">
                  {activeModalTier.code}
                </span>

                <button
                  onClick={() => handleCopyCode(activeModalTier.code)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-rose-100 text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedCode === activeModalTier.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 opacity-70" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp Claim CTA */}
            <a
              href={createWhatsAppUrl(activeModalTier)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-sm font-semibold text-white transition-all shadow-lg cursor-pointer hover:opacity-95"
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                boxShadow: "0 10px 25px -5px rgba(22, 101, 52, 0.4)",
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Klaim ke WhatsApp Aku</span>
            </a>

            {/* Secondary Dismiss */}
            <button
              onClick={() => setActiveModalTier(null)}
              className="mt-3 text-xs text-rose-200/50 hover:text-rose-200 transition-colors cursor-pointer py-1"
            >
              Tutup & lanjut klik lagi 💕
            </button>
          </div>
        </div>
      )}

      {/* Footer floats */}
      <div className="text-center mt-4 pb-4">
        <div className="flex justify-center items-center gap-4 text-xl mb-4">
          <span style={{ display:"inline-block", animation:"floatY 1.8s ease-in-out infinite alternate" }}>
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400/50" />
          </span>
          <span style={{ display:"inline-block", animation:"floatY 1.9s ease-in-out 0.4s infinite alternate" }}>
            <Heart className="w-4 h-4 text-rose-300 fill-rose-300/40" />
          </span>
          <span style={{ display:"inline-block", animation:"floatY 2.0s ease-in-out 0.1s infinite alternate" }}>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/50" />
          </span>
        </div>
        <p className="text-xs" style={{ color:"var(--text-muted)" }}>made with endless love and longing</p>
      </div>

      <style>{`
        @keyframes floatY {
          from { transform: translateY(0); }
          to   { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
