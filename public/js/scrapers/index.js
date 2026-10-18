// public/js/scrapers/index.js
import { scraperFetch } from "./httpHelper.js";
import { extractMedia as localExtractMedia } from "../../src-scrapers/index.js";

export const BUNDLED_SCRAPER_VERSION = 1;
window.__SKYC_BUNDLED_SCRAPER_VERSION__ = BUNDLED_SCRAPER_VERSION;

let _engineInstance = null;

/**
 * Loads the active scraper engine (either from OTA hot-patch or bundled engine)
 */
export async function getScraperEngine() {
  if (_engineInstance) return _engineInstance;

  // 1. Check for OTA Hot-Patch in localStorage
  try {
    const patchedScript = localStorage.getItem("skyc_patched_scraper_bin");
    const activeVer = parseInt(localStorage.getItem("skyc_active_scraper_version") || "0", 10);

    if (patchedScript && activeVer >= BUNDLED_SCRAPER_VERSION) {
      console.log(`[Skyc] Executing OTA Hot-Patched Scraper Core v${activeVer}`);
      // Evaluate in isolated scope
      const otaFunction = new Function("exports", patchedScript);
      const otaExports = {};
      otaFunction(otaExports);
      if (otaExports.__SkycScraperEngine?.extractMedia || window.__SkycScraperEngine?.extractMedia) {
        _engineInstance = otaExports.__SkycScraperEngine || window.__SkycScraperEngine;
        return _engineInstance;
      }
    }
  } catch (otaErr) {
    console.warn("[Skyc] OTA Patch loader error, falling back to bundled core:", otaErr);
  }

  // 2. Check if bundle.js was loaded as global script
  if (window.__SkycScraperEngine?.extractMedia) {
    _engineInstance = window.__SkycScraperEngine;
    return _engineInstance;
  }

  // 3. Fallback to direct ES module
  _engineInstance = {
    extractMedia: (url) => localExtractMedia(url, scraperFetch),
  };
  return _engineInstance;
}

/**
 * Public wrapper for media extraction
 */
export async function analyzeUrl(url) {
  const engine = await getScraperEngine();
  if (engine.extractMedia) {
    return await engine.extractMedia(url, scraperFetch);
  }
  return await localExtractMedia(url, scraperFetch);
}
