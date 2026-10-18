// public/js/modules/updateScrapers.js
import { BUNDLED_SCRAPER_VERSION } from "../scrapers/index.js";
import { showToast, triggerHaptic } from "../utils/index.js";

const MANIFEST_URL = "https://raw.githubusercontent.com/elskyx/Skyc/main/public/scrapers-version.json";
const BUNDLE_URL = "https://raw.githubusercontent.com/elskyx/Skyc/main/public/js/scrapers/bundle.js";

/**
 * Checks GitHub Raw CDN for OTA Scraper Patches
 */
export async function checkOtaScraperUpdate(manual = false) {
  try {
    const activeVer = parseInt(localStorage.getItem("skyc_active_scraper_version") || `${BUNDLED_SCRAPER_VERSION}`, 10);
    const activeHash = localStorage.getItem("skyc_active_scraper_hash") || "";

    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Manifest could not be reached.");

    const manifest = await res.json();

    if (manifest.version > activeVer || (manifest.version === activeVer && manifest.sha256 !== activeHash)) {
      if (manual) showToast("New OTA Scraper patch found! Downloading...", "info");

      // Download new bundle
      const bundleRes = await fetch(BUNDLE_URL, { cache: "no-store" });
      if (!bundleRes.ok) throw new Error("Scraper bundle download failed.");

      const bundleCode = await bundleRes.text();

      // Save to localStorage
      localStorage.setItem("skyc_patched_scraper_bin", bundleCode);
      localStorage.setItem("skyc_active_scraper_version", `${manifest.version}`);
      localStorage.setItem("skyc_active_scraper_hash", manifest.sha256);

      triggerHaptic("medium");
      showToast(`Scrapers hot-patched to v${manifest.version}!`, "success");
      return { updated: true, version: manifest.version };
    } else {
      if (manual) {
        showToast(`Scrapers are up to date (v${activeVer})`, "success");
      }
      return { updated: false, version: activeVer };
    }
  } catch (err) {
    if (manual) {
      showToast("OTA update check failed: " + err.message, "warning");
    }
    return { error: err.message };
  }
}
