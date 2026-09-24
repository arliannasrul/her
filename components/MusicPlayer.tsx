"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Music, Play, Pause, Volume1, Volume2, SkipForward, SkipBack, GripHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { PLAYLIST, SongItem } from "@/lib/photos";
import { getLenis } from "@/lib/lenis";

gsap.registerPlugin(useGSAP);

// Romantic music box melody fallback
const MELODY_NOTES = [
  523.25, 659.25, 783.99, 1046.50,
  783.99, 659.25, 783.99, 659.25,
  440.00, 523.25, 659.25, 880.00,
  659.25, 523.25, 659.25, 523.25,
  349.23, 440.00, 523.25, 698.46,
  523.25, 440.00, 523.25, 440.00,
  392.00, 493.88, 587.33, 783.99,
  587.33, 493.88, 587.33, 493.88,
];

interface MusicPlayerProps {
  isVisible?: boolean;
}

export default function MusicPlayer({ isVisible = true }: MusicPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const eqTweenRef   = useRef<gsap.core.Tween | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const synthStepRef = useRef(0);
  const fadeTweenRef = useRef<gsap.core.Tween | null>(null);
  const lastSectionSongRef = useRef<number>(-1);
  const isPlayingRef = useRef(false); // mirror of isPlaying for use in callbacks
  const volumeRef = useRef(0.3);     // mirror of volume for use in callbacks

  // Active playlist with non-empty URLs, fallback to default if all empty
  const activePlaylist: SongItem[] = PLAYLIST.filter((s) => s.url && s.url.trim().length > 0);
  const playlist = activePlaylist.length > 0
    ? activePlaylist
    : [{ id: 1, title: "Romantic Melody", artist: "Special for Bae", url: "/music.mp3" }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [volume, setVolume]             = useState(0.3);
  const [statusText, setStatusText]     = useState("ready to play");
  const [isCollapsed, setIsCollapsed]   = useState(false);

  // Drag state
  const dragStart = useRef({ px: 0, py: 0, mx: 0, my: 0 }); // pointer start
  const isDragging = useRef(false);

  // Keep refs in sync so callbacks always have fresh values
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const currentSong = playlist[currentIndex] || playlist[0];

  // ── Web Audio Synth (Romantic Music Box Fallback) ───────────────
  const playNote = useCallback((freq: number, currentVol: number) => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === "closed") return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const now = ctx.currentTime;
      const peakVol = Math.max(0.001, currentVol * 0.22);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // AudioContext safe catch
    }
  }, []);

  const stopSynth = useCallback(() => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    synthStepRef.current = 0;
  }, []);

  const startSynth = useCallback((currentVol: number, withFade = false) => {
    stopSynth();
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtxClass();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const fadeObj = { vol: withFade ? 0.02 : currentVol };
      if (withFade) {
        gsap.to(fadeObj, {
          vol: currentVol,
          duration: 2.8,
          ease: "power2.out",
        });
      }

      const tick = () => {
        const freq = MELODY_NOTES[synthStepRef.current % MELODY_NOTES.length];
        playNote(freq, fadeObj.vol);
        synthStepRef.current += 1;
      };

      tick();
      synthTimerRef.current = setInterval(tick, 360);
    } catch {
      // AudioContext not supported
    }
  }, [playNote, stopSynth]);

  // ── Play current song with optional smooth volume fade-in ────────
  const startPlayback = useCallback((withFade = false) => {
    if (fadeTweenRef.current) {
      fadeTweenRef.current.kill();
    }

    const audio = audioRef.current;
    if (audio && currentSong.url) {
      // Ensure audio source is set
      const encodedSrc = encodeURI(currentSong.url);
      if (!audio.src || !audio.src.includes(encodedSrc)) {
        audio.src = encodedSrc;
      }

      if (withFade) {
        audio.volume = 0;
      } else {
        audio.volume = volume;
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setStatusText("now playing");
            if (withFade) {
              // Smooth volume fade-in transition over 2.8 seconds
              fadeTweenRef.current = gsap.to(audio, {
                volume: volume,
                duration: 2.8,
                ease: "power2.out",
              });
            }
          })
          .catch((err) => {
            console.warn("Audio play blocked or failed, falling back to synth:", err);
            startSynth(volume, withFade);
            setIsPlaying(true);
            setStatusText("romantic melody");
          });
        return;
      }
    }

    // Fallback if no audio element
    startSynth(volume, withFade);
    setIsPlaying(true);
    setStatusText("romantic melody");
  }, [currentSong.url, volume, startSynth]);

  const pausePlayback = useCallback(() => {
    if (fadeTweenRef.current) {
      fadeTweenRef.current.kill();
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    stopSynth();
    setIsPlaying(false);
    setStatusText("paused");
  }, [stopSynth]);

  // ── Next & Prev song handlers ──────────────────────────────────
  const playNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  // ── Setup Audio Element ─────────────────────────────────────────
  useEffect(() => {
    let isSubscribed = true;
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;

    const handleEnded = () => {
      if (!isSubscribed) return;
      if (playlist.length > 1) {
        playNext();
      } else {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("ended", handleEnded);

    try {
      audio.src = encodeURI(currentSong.url);
      audio.load();
    } catch {
      // Ignored
    }

    return () => {
      isSubscribed = false;
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.removeAttribute("src");
      audioRef.current = null;
    };
  }, [currentIndex, currentSong.url, playNext, playlist.length]); // Reload audio when current song changes

  // Auto-play / crossfade when song changes
  useEffect(() => {
    if (!isPlayingRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Kill any pending fade
    if (fadeTweenRef.current) fadeTweenRef.current.kill();

    const targetVol = volumeRef.current;
    const currentVol = audio.volume;

    const doFadeIn = () => {
      audio.volume = 0;
      audio.play()
        .then(() => {
          fadeTweenRef.current = gsap.to(audio, {
            volume: targetVol,
            duration: 1.2,
            ease: "power2.out",
          });
        })
        .catch(() => {});
    };

    if (currentVol > 0.01) {
      // Fade out then switch
      fadeTweenRef.current = gsap.to(audio, {
        volume: 0,
        duration: 0.6,
        ease: "power1.in",
        onComplete: doFadeIn,
      });
    } else {
      doFadeIn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ── Section Scroll → Auto Song Switch ─────────────────────────
  // Maps section index (0-5) to playlist song index
  const getSongForSection = useCallback((sectionIndex: number): number => {
    const total = playlist.length;
    if (total <= 1) return 0;
    const sectionCount = 6;
    return Math.min(Math.floor((sectionIndex / sectionCount) * total), total - 1);
  }, [playlist.length]);

  useEffect(() => {
    let rafId: number;

    const checkSections = () => {
      const sections = document.querySelectorAll<HTMLElement>("[data-section]");
      if (sections.length === 0) return false;

      const viewportMid = window.innerHeight / 2;
      let closestSection: HTMLElement | null = null;
      let closestDist = Infinity;

      sections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elMid = rect.top + rect.height / 2;
        const dist = Math.abs(elMid - viewportMid);
        if (dist < closestDist) {
          closestDist = dist;
          closestSection = el;
        }
      });

      if (!closestSection) return true;
      const sectionIndex = Number((closestSection as HTMLElement).dataset.section ?? -1);
      if (sectionIndex < 0) return true;

      const songIndex = getSongForSection(sectionIndex);
      if (songIndex !== lastSectionSongRef.current) {
        lastSectionSongRef.current = songIndex;
        setCurrentIndex(songIndex);
      }
      return true;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkSections);
    };

    // Wait until sections are in DOM (they appear after modal closes)
    const tryAttach = () => {
      const sections = document.querySelectorAll("[data-section]");
      if (sections.length > 0) {
        // Run once immediately to set initial state
        checkSections();
        // Listen on both native scroll (fallback) and Lenis scroll event
        window.addEventListener("scroll", onScroll, { passive: true });
        const lenis = getLenis();
        if (lenis) {
          lenis.on("scroll", onScroll);
        }
      } else {
        // Retry after short delay
        setTimeout(tryAttach, 300);
      }
    };
    tryAttach();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      const lenis = getLenis();
      if (lenis) {
        lenis.off("scroll", onScroll);
      }
    };
  }, [getSongForSection]);

  // Auto-start trigger from "Yess" click in OpeningModal with smooth audio fade-in
  useEffect(() => {
    const onStartSignal = () => {
      startPlayback(true);
    };
    window.addEventListener("start-romantic-music", onStartSignal);

    return () => {
      window.removeEventListener("start-romantic-music", onStartSignal);
    };
  }, [startPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeTweenRef.current) {
        fadeTweenRef.current.kill();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current = null;
      }
      stopSynth();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopSynth]);

  // ── GSAP equalizer ───────────────────────────────────────────────
  useGSAP(() => {
    const bars = containerRef.current?.querySelectorAll(".eq-bar");
    if (!bars?.length) return;

    eqTweenRef.current = gsap.to(bars, {
      scaleY: "random(0.18, 1.25)",
      duration: 0.35,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      stagger: 0.08,
      paused: true,
      transformOrigin: "bottom center",
    });
  }, { scope: containerRef });

  useEffect(() => {
    const eq = eqTweenRef.current;
    if (!eq) return;
    if (isPlaying) {
      eq.play();
    } else {
      eq.pause();
      const bars = containerRef.current?.querySelectorAll(".eq-bar");
      if (bars) gsap.to(bars, { scaleY: 0.15, duration: 0.3, ease: "power2.out" });
    }
  }, [isPlaying]);

  // ── Controls ─────────────────────────────────────────────────────
  const togglePlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback(false);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (fadeTweenRef.current) {
      fadeTweenRef.current.kill();
    }
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't drag if clicking a button, input, or label
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === "button" || tag === "input" || tag === "label") return;
    if ((e.target as HTMLElement).closest("button, input, label")) return;
    isDragging.current = true;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStart.current = {
      px: e.clientX,
      py: e.clientY,
      mx: rect.left,
      my: rect.top,
    };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
    el.style.transition = "none";
    e.preventDefault();
  };

  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    let newLeft = dragStart.current.mx + dx;
    let newTop  = dragStart.current.my + dy;
    // Clamp to viewport
    const pad = 8;
    newLeft = Math.max(pad, Math.min(window.innerWidth  - el.offsetWidth  - pad, newLeft));
    newTop  = Math.max(pad, Math.min(window.innerHeight - el.offsetHeight - pad, newTop));
    el.style.left   = newLeft + "px";
    el.style.top    = newTop  + "px";
    el.style.right  = "auto";
    el.style.bottom = "auto";
  };

  const onDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const el = containerRef.current;
    if (!el) return;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = "";
    el.style.transition = "";
  };

  // ── Reveal transition when isVisible changes ────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isVisible) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        pointerEvents: "auto",
        duration: 0.6,
        delay: 0.2,
        ease: "power2.out",
      });
    } else {
      gsap.set(el, {
        opacity: 0,
        y: 24,
        pointerEvents: "none",
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      id="music-player"
      className="fixed z-40 glass rounded-2xl shadow-2xl select-none"
      style={{
        bottom: 24,
        right: 24,
        width: 300,
        maxWidth: "calc(100vw - 48px)",
        border: "1px solid var(--border-rose)",
        background: "rgba(18, 9, 21, 0.92)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
    >
      {/* ── Drag Handle + Header ── */}
      <div
        className="flex items-center gap-2 px-4 pt-3 pb-2"
        style={{ cursor: "grab", touchAction: "none" }}
      >
        {/* Grip icon */}
        <GripHorizontal className="w-3.5 h-3.5 text-rose-300/40 flex-shrink-0" />

        {/* Song info */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Music className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <p className="text-xs font-semibold truncate text-white" style={{ fontFamily: "var(--font-display)" }}>
              {currentSong.title}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-rose-200/60 truncate">
              {currentSong.artist || "Special for Bae"}
            </span>
            {playlist.length > 1 && (
              <span className="text-[9px] px-1.5 rounded-full bg-white/10 text-rose-300 font-mono">
                {currentIndex + 1}/{playlist.length}
              </span>
            )}
          </div>
        </div>

        {/* Equalizer bars */}
        {!isCollapsed && (
          <div className="flex items-end gap-[3px] flex-shrink-0" style={{ height: 18 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="eq-bar"
                style={{
                  width: 3,
                  height: 16,
                  background: "linear-gradient(to top, var(--rose-mid), var(--gold))",
                  borderRadius: 2,
                  transformOrigin: "bottom center",
                  transform: "scaleY(0.15)",
                }}
              />
            ))}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed((c) => !c)}
          className="p-1 rounded-full text-rose-300/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          title={isCollapsed ? "Perluas" : "Sembunyikan"}
          aria-label={isCollapsed ? "Expand music player" : "Collapse music player"}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Controls (collapsible) ── */}
      <div
        style={{
          maxHeight: isCollapsed ? 0 : 200,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="px-4 pb-3 flex flex-col gap-2 border-t border-white/5 pt-2">
          {/* Playback buttons */}
          <div className="flex items-center justify-center gap-2">
            {playlist.length > 1 && (
              <button
                onClick={playPrev}
                className="p-1.5 rounded-full text-rose-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Lagu Sebelumnya"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            <button
              id="play-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause music" : "Play music"}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, var(--rose-mid), var(--rose-dark))"
                  : "rgba(255,255,255,0.08)",
                border: "1px solid var(--border-rose)",
                color: "white",
                boxShadow: isPlaying ? "0 0 14px rgba(194,52,90,0.5)" : "none",
              }}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-white" />
              ) : (
                <Play className="w-4 h-4 fill-current text-white ml-0.5" />
              )}
            </button>

            {playlist.length > 1 && (
              <button
                onClick={playNext}
                className="p-1.5 rounded-full text-rose-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Lagu Selanjutnya"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2" style={{ width: "100%", minWidth: 0 }}>
            <Volume1 className="w-3.5 h-3.5 text-rose-300/70 select-none flex-shrink-0" />
            <input
              type="range"
              className="heart-slider cursor-pointer"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              style={{ flex: 1, minWidth: 0, width: "100%", accentColor: "var(--rose-mid)" }}
              aria-label="Music volume"
            />
            <Volume2 className="w-3.5 h-3.5 text-rose-300/70 select-none flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
