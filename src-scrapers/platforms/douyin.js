// src-scrapers/platforms/douyin.js
import { scrapeTikTok } from "./tiktok.js";

export async function scrapeDouyin(url, fetchClient) {
  // TikWM also handles Douyin URLs directly
  try {
    const res = await scrapeTikTok(url, fetchClient);
    res.platform = "douyin";
    return res;
  } catch (err) {
    console.warn("[Skyc Scraper] Douyin fallback attempt:", err);
    throw new Error("Douyin video could not be extracted.");
  }
}
