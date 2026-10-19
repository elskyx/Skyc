// public/js/modules/update.js
import { showToast } from "../utils/index.js";

export const APP_CURRENT_VERSION = "1.1.6";

/**
 * Checks GitHub Releases API for newer version
 */
export async function checkForAppUpdates(manual = false) {
  try {
    const res = await fetch("https://api.github.com/repos/elskyx/Skyc/releases/latest", {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!res.ok) throw new Error("Could not contact GitHub Releases API");

    const release = await res.json();
    const latestTag = (release.tag_name || "").replace(/^v/, "");

    if (isVersionGreater(latestTag, APP_CURRENT_VERSION)) {
      showToast(`Update available: v${latestTag}! Check GitHub Releases.`, "info");
      return { updateAvailable: true, latestVersion: latestTag, url: release.html_url };
    } else if (manual) {
      showToast(`Skyc is up to date (v${APP_CURRENT_VERSION})`, "success");
    }
    return { updateAvailable: false, latestVersion: latestTag };
  } catch (err) {
    if (manual) {
      showToast("Unable to check for updates right now.", "warning");
    }
    return { error: err.message };
  }
}

function isVersionGreater(latest, current) {
  if (!latest || !current) return false;
  const l = latest.split(".").map(Number);
  const c = current.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const lPart = l[i] || 0;
    const cPart = c[i] || 0;
    if (lPart > cPart) return true;
    if (lPart < cPart) return false;
  }
  return false;
}
