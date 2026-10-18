// public/js/downloader/postProcess.js
import { triggerHaptic, showToast } from "../utils/index.js";
import { addToHistory } from "../modules/history.js";
import { refreshGalleryPage } from "../modules/gallery.js";

/**
 * Handles completion tasks after file has successfully been written
 */
export async function postProcessDownload({
  title,
  sourceUrl,
  platform,
  filename,
  fileSize,
  mediaType = "video",
  thumbnailUrl = ""
}) {
  // 1. Android MediaStore Scan Bridge
  if (window.SkycNativeHttp?.scanFile) {
    try {
      window.SkycNativeHttp.scanFile(filename);
    } catch (_) {}
  }

  // 2. Add item to persistent LocalStorage history
  addToHistory({
    id: `skyc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title || filename,
    sourceUrl,
    platform: platform || "generic",
    filename,
    fileSize: fileSize || 0,
    mediaType,
    thumbnailUrl,
    timestamp: Date.now()
  });

  // 3. Refresh Gallery View
  try {
    refreshGalleryPage();
  } catch (_) {}

  // 4. Haptic & Toast Feedback
  triggerHaptic("medium");
  showToast(`Saved: ${filename}`, "success");
}
