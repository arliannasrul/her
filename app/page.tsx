"use client";
import { useState, useEffect } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import OpeningModal from "@/components/OpeningModal";
import HeroSection from "@/components/HeroSection";
import TimelineSection from "@/components/TimelineSection";
import GallerySection from "@/components/GallerySection";
import HerGallerySection from "@/components/HerGallerySection";
import MiniGame from "@/components/MiniGame";
import LetterClosing from "@/components/LetterClosing";
import MusicPlayer from "@/components/MusicPlayer";
import FallingPetalsBackground from "@/components/FallingPetalsBackground";

import CustomCursor from "@/components/CustomCursor";

export default function Home() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (entered) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [entered]);

  return (
    <SmoothScrollProvider>
      {/* Global custom romantic cursor */}
      <CustomCursor />

      {/* Opening gate — fullscreen until "Yess ❤️" clicked */}
      {!entered && <OpeningModal onDone={() => setEntered(true)} />}

      {/* Main content — revealed after modal exits */}
      {entered && (
        <>
          {/* Animated Falling Petals Background for sections below Hero */}
          <FallingPetalsBackground />

          <HeroSection />
          <TimelineSection />
          <GallerySection />
          <HerGallerySection />
          <MiniGame />
          <LetterClosing />
          <MusicPlayer />
        </>
      )}
    </SmoothScrollProvider>
  );
}

