import * as React from "react";
import { TiltedGridHero, type TiltedGridImage } from "@/components/ui/tilted-grid-hero";

export const SKYC_HERO_SNAPSHOTS: TiltedGridImage[] = [
  {
    src: "/assets/snapshots/skyc-downloader-home-dark.png",
    alt: "Skyc Downloader Home URL Composer in Claude Obsidian Dark Mode",
  },
  {
    src: "/assets/snapshots/skyc-downloader-home-light.png",
    alt: "Skyc Downloader Home URL Composer in Warm Parchment Light Mode",
  },
  {
    src: "/assets/snapshots/skyc-downloader-batch.png",
    alt: "Skyc Downloader Multi-stream Batch Downloader Queue",
  },
  {
    src: "/assets/snapshots/skyc-downloader-downloads.png",
    alt: "Skyc Downloader Media Player and Photo Gallery",
  },
  {
    src: "/assets/snapshots/skyc-downloader-platforms.png",
    alt: "Skyc Downloader 16+ Supported Social Media Platforms Matrix",
  },
  {
    src: "/assets/snapshots/skyc-downloader-settings.png",
    alt: "Skyc Downloader Zero-Cloud Storage & OTA Hot-Patch Settings",
  },
];

export default function TiltedGridHeroDemo() {
  return (
    <TiltedGridHero
      images={SKYC_HERO_SNAPSHOTS}
      speed={5}
      curve={75}
      axis={52}
      className="h-[620px] w-full rounded-2xl border border-neutral-800 bg-[#141413] text-[#FAF9F5]"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center pointer-events-auto">
        <div className="flex flex-col items-center gap-4 px-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D97757]/30 bg-[#D97757]/10 text-xs font-mono text-[#D97757] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse"></span>
            Zero-Cloud Architecture • 100% Free & Open Source
          </div>
          <h1 className="text-balance text-4xl sm:text-6xl font-serif tracking-tight text-[#FAF9F5]">
            Save anything,<br />
            <span className="italic text-[#D97757]">from anywhere.</span>
          </h1>
          <p className="max-w-xl text-balance text-sm sm:text-base text-neutral-400 font-sans">
            Universal media downloader for Android, Windows, and CLI. Pristine multi-stream extraction from 16+ platforms with zero tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 px-6">
          <a
            href="https://github.com/elskyx/Skyc/releases/latest"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D97757] text-white font-medium text-sm hover:brightness-110 transition-all shadow-lg shadow-[#D97757]/20"
          >
            Download Skyc
          </a>
          <a
            href="#simulator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-700 bg-neutral-900/60 text-neutral-200 font-medium text-sm hover:bg-neutral-800 transition-all"
          >
            Try Live Simulator
          </a>
        </div>
      </div>
    </TiltedGridHero>
  );
}
