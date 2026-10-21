// src-scrapers/index.js
import { detectPlatform } from "../public/js/utils/urlUtils.js";
import { scrapeTikTok } from "./platforms/tiktok.js";
import { scrapeInstagram } from "./platforms/instagram.js";
import { scrapeYouTube } from "./platforms/youtube.js";
import { scrapeTwitter } from "./platforms/twitter.js";
import { scrapeSpotify } from "./platforms/spotify.js";
import { scrapeAppleMusic } from "./platforms/applemusic.js";
import { scrapePinterest } from "./platforms/pinterest.js";
import { scrapeFacebook } from "./platforms/facebook.js";
import { scrapeThreads } from "./platforms/threads.js";
import { scrapeBandcamp } from "./platforms/bandcamp.js";
import { scrapePixiv } from "./platforms/pixiv.js";
import { scrapeBilibili } from "./platforms/bilibili.js";
import { scrapeDouyin } from "./platforms/douyin.js";
import { scrapeRedNote } from "./platforms/rednote.js";
import { scrapeReddit } from "./platforms/reddit.js";
import { scrapeTeraBox } from "./platforms/terabox.js";

export const SCRAPER_VERSION = 2;

export const PLATFORM_REGISTRY = {
  tiktok: scrapeTikTok,
  douyin: scrapeDouyin,
  instagram: scrapeInstagram,
  youtube: scrapeYouTube,
  twitter: scrapeTwitter,
  spotify: scrapeSpotify,
  applemusic: scrapeAppleMusic,
  pinterest: scrapePinterest,
  facebook: scrapeFacebook,
  threads: scrapeThreads,
  bandcamp: scrapeBandcamp,
  pixiv: scrapePixiv,
  bilibili: scrapeBilibili,
  rednote: scrapeRedNote,
  reddit: scrapeReddit,
  terabox: scrapeTeraBox,
};

/**
 * Universal Scraper Dispatcher
 */
export async function extractMedia(url, fetchClient) {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid or empty URL provided.");
  }

  const platform = detectPlatform(url);
  const handler = PLATFORM_REGISTRY[platform];

  if (!handler) {
    throw new Error(`Platform '${platform}' is not supported yet.`);
  }

  return await handler(url, fetchClient);
}
