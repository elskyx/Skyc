// public/js/downloader/resolver.js
import { scraperFetch } from "../scrapers/httpHelper.js";

/**
 * Checks if a media stream URL requires an async secondary resolution pass
 */
export function needsAsyncResolving(url) {
  if (!url || typeof url !== "string") return false;
  return (
    url.startsWith("applemusic_resolve:") ||
    url.startsWith("spotidown_resolve:") ||
    url.startsWith("youtube_resolve:") ||
    url.includes("token=snapsave")
  );
}

/**
 * Resolves indirect tokens to direct downloadable media URLs
 */
export async function resolveDownloadUrl({ url, updateProgress = () => {}, isCancelled = () => false }) {
  if (!url) throw new Error("Empty URL passed to resolver");

  if (url.startsWith("applemusic_resolve:")) {
    const payloadStr = url.replace("applemusic_resolve:", "");
    updateProgress(25, "Resolving Apple Music track...");

    const res = await scraperFetch({
      method: "POST",
      url: "https://aplmate.com/action/track",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://aplmate.com/",
        Origin: "https://aplmate.com",
      },
      data: payloadStr,
    });

    const parsed = typeof res === "string" ? JSON.parse(res) : res;
    const html = (parsed && parsed.data) || "";
    const linkMatch = html.match(/href="([^"]*(?:\/dl\?token=|download)[^"]*)"/i);
    if (linkMatch) {
      let resolved = linkMatch[1];
      if (!resolved.startsWith("http")) resolved = `https://aplmate.com${resolved}`;
      return resolved;
    }
    throw new Error("Unable to resolve Apple Music download link");
  }

  if (url.startsWith("spotidown_resolve:")) {
    const payload = url.replace("spotidown_resolve:", "");
    updateProgress(25, "Resolving Spotify MP3 audio...");

    const res = await scraperFetch({
      method: "POST",
      url: "https://spotidown.com/api/download-track",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://spotidown.com/",
      },
      data: payload,
    });

    const parsed = typeof res === "string" ? JSON.parse(res) : res;
    if (parsed && parsed.downloadUrl) {
      return parsed.downloadUrl;
    }
    throw new Error("Unable to resolve Spotify audio link");
  }

  return url;
}
