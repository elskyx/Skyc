"use client"

import SculptureHero from "@/components/ui/liquid-sculpture-hero"
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer"

export default function Demo() {
  // w-full matters: 21st centres demos in a flex wrapper, and a flex item
  // left at width:auto shrinks the canvas to 0px wide.
  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FAF9F5] text-[#141413]">
      <SculptureHero
        brand="Skyc®"
        eyebrow="Zero-Cloud Media Engine — v1.6.7"
        headline={"Save anything,\nfrom anywhere."}
        headlineAccent="from anywhere."
        body="Universal, zero-cloud media downloader for Android, Windows Desktop & CLI. 16+ platforms, pristine multi-stream extraction, zero tracking."
        primaryCta={{ label: "Download Skyc", href: "#downloads" }}
        secondaryCta={{ label: "Try Simulator", href: "#simulator" }}
        hint="Move across the mascot"
        hintTouch="Touch the mascot"
        src="./favicon.png"
        darkSrc="./favicon.png"
      />
      <div className="w-full">
        <HalftoneWordmarkFooter wordmark="skyc" />
      </div>
    </div>
  )
}
