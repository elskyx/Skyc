// public/js/downloader/headers.js
import { getUserAgent } from "../utils/index.js";

/**
 * Builds HTTP headers suited for downloading stream files without 403 Forbidden errors
 */
export function buildDownloadHeaders(url, customReferer = null) {
  const headers = {
    "User-Agent": getUserAgent(),
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  };

  try {
    const parsed = new URL(url);
    if (customReferer) {
      headers["Referer"] = customReferer;
    } else {
      headers["Referer"] = `${parsed.protocol}//${parsed.hostname}/`;
    }
    headers["Origin"] = `${parsed.protocol}//${parsed.hostname}`;
  } catch (_) {}

  // Header spoofing flags
  const isSpoofing = localStorage.getItem("skyc_header_spoofing") !== "false";
  if (isSpoofing) {
    headers["Sec-Fetch-Dest"] = "video";
    headers["Sec-Fetch-Mode"] = "no-cors";
    headers["Sec-Fetch-Site"] = "cross-site";
  }

  return headers;
}
