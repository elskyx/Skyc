// public/js/utils/urlUtils.js

/**
 * Strips tracking parameters and normalizes URLs
 */
export function cleanUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let trimmed = rawUrl.trim();

  // If text contains a URL surrounded by other text, extract it
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    trimmed = urlMatch[0];
  }

  try {
    const urlObj = new URL(trimmed);
    const trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "si", "fbclid", "igsh", "igshid", "feature", "source", "ref", "share_id",
      "_r", "is_from_webapp", "sender_device", "timestamp"
    ];
    for (const param of trackingParams) {
      urlObj.searchParams.delete(param);
    }
    return urlObj.toString();
  } catch (_) {
    return trimmed;
  }
}

/**
 * Detects the platform identifier from a URL
 */
export function detectPlatform(url) {
  if (!url) return "unknown";
  const lower = url.toLowerCase();

  if (lower.includes("tiktok.com") || lower.includes("douyin.com")) {
    return lower.includes("douyin.com") ? "douyin" : "tiktok";
  }
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("music.apple.com")) return "applemusic";
  if (lower.includes("pinterest.com") || lower.includes("pin.it")) return "pinterest";
  if (lower.includes("facebook.com") || lower.includes("fb.watch")) return "facebook";
  if (lower.includes("threads.net")) return "threads";
  if (lower.includes("bandcamp.com")) return "bandcamp";
  if (lower.includes("pixiv.net")) return "pixiv";
  if (lower.includes("bilibili.com") || lower.includes("b23.tv")) return "bilibili";
  if (lower.includes("xiaohongshu.com") || lower.includes("xhslink.com")) return "rednote";
  if (lower.includes("reddit.com") || lower.includes("redd.it")) return "reddit";
  if (lower.includes("terabox.com") || lower.includes("1024tera.com")) return "terabox";

  return "generic";
}

/**
 * Formats a platform key into display label
 */
export function getPlatformDisplayName(key) {
  const map = {
    tiktok: "TikTok",
    douyin: "Douyin",
    instagram: "Instagram",
    youtube: "YouTube",
    twitter: "X / Twitter",
    spotify: "Spotify",
    applemusic: "Apple Music",
    pinterest: "Pinterest",
    facebook: "Facebook",
    threads: "Threads",
    bandcamp: "Bandcamp",
    pixiv: "Pixiv",
    bilibili: "Bilibili",
    rednote: "RedNote",
    reddit: "Reddit",
    terabox: "TeraBox",
    generic: "Web"
  };
  return map[key] || "Unknown";
}
