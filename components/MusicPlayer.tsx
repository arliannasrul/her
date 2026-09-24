"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Music, Play, Pause, Volume1, Volume2, SkipForward, SkipBack } from "lucide-react";
import { PLAYLIST, SongItem } from "@/lib/photos";

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

export default function MusicPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const eqTweenRef   = useRef<gsap.core.Tween | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const synthStepRef = useRef(0);
  const fadeTweenRef = useRef<gsap.core.Tween | null>(null);

  // Active playlist with non-empty URLs, fallback to default if all empty
  const activePlaylist: SongItem[] = PLAYLIST.filter((s) => s.url && s.url.trim().length > 0);
  const playlist = activePlaylist.length > 0
    ? activePlaylist
    : [{ id: 1, title: "Romantic Melody", artist: "Special for Bae", url: "/music.mp3" }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [volume, setVolume]             = useState(0.7);
  const [statusText, setStatusText]     = useState("ready to play");

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

  // Auto-play when song changes if already playing
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentIndex, isPlaying]);

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

  return (
    <div
      ref={containerRef}
      id="music-player"
      className="fixed bottom-6 right-6 z-40 glass rounded-2xl px-5 py-4 flex flex-col gap-3 shadow-2xl transition-all"
      style={{
        minWidth: 260,
        maxWidth: 320,
        border: "1px solid var(--border-rose)",
        background: "rgba(18, 9, 21, 0.88)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Row: label + eq */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <p className="text-xs font-semibold truncate text-white" style={{ fontFamily: "var(--font-display)" }}>
              {currentSong.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-rose-200/60 truncate">
              {currentSong.artist || "Special for Bae"}
            </span>
            {playlist.length > 1 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-rose-300 font-mono">
                {currentIndex + 1}/{playlist.length}
              </span>
            )}
          </div>
        </div>

        {/* Equalizer bars */}
        <div className="flex items-end gap-[3px] flex-shrink-0" style={{ height: 20, paddingBottom: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="eq-bar"
              style={{
                width: 3,
                height: 18,
                background: "linear-gradient(to top, var(--rose-mid), var(--gold))",
                borderRadius: 2,
                transformOrigin: "bottom center",
                transform: "scaleY(0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Row: Playback Controls (Prev, Play/Pause, Next) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Previous Song */}
          {playlist.length > 1 && (
            <button
              onClick={playPrev}
              className="p-1.5 rounded-full text-rose-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Lagu Sebelumnya"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          {/* Play / Pause button */}
          <button
            id="play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md"
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

          {/* Next Song */}
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
        <div className="flex items-center gap-1.5 w-24">
          <Volume1 className="w-3 h-3 text-rose-300/70 select-none flex-shrink-0" />
          <input
            type="range"
            className="heart-slider flex-1 cursor-pointer h-1"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            style={{ accentColor: "var(--rose-mid)" }}
            aria-label="Music volume"
          />
          <Volume2 className="w-3 h-3 text-rose-300/70 select-none flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
