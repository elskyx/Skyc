// public/js/modules/intents.js
import { cleanUrl, detectPlatform } from "../utils/urlUtils.js";
import { showToast, triggerHaptic } from "../utils/index.js";

let lastCheckedClipboardUrl = "";

/**
 * Reads the system clipboard and populates the URL bar if valid
 */
export async function checkClipboardForMediaUrl(urlInputEl, autoAnalyze = false) {
  try {
    let clipText = "";

    // 1. Capacitor Clipboard Plugin
    if (window.Capacitor?.Plugins?.Clipboard) {
      const res = await window.Capacitor.Plugins.Clipboard.read();
      clipText = res?.value || "";
    }
    // 2. Standard Web Clipboard API
    else if (navigator.clipboard?.readText) {
      clipText = await navigator.clipboard.readText();
    }

    if (!clipText || typeof clipText !== "string") return;

    const cleaned = cleanUrl(clipText);
    const platform = detectPlatform(cleaned);

    if (platform !== "unknown" && platform !== "generic" && cleaned !== lastCheckedClipboardUrl) {
      lastCheckedClipboardUrl = cleaned;

      if (urlInputEl && !urlInputEl.value.trim()) {
        urlInputEl.value = cleaned;
        triggerHaptic("light");
        showToast(`Detected ${platform.toUpperCase()} link from clipboard!`);

        // Trigger input event to update clear/paste button states
        urlInputEl.dispatchEvent(new Event("input", { bubbles: true }));

        if (autoAnalyze) {
          const analyzeBtn = document.getElementById("analyzeBtn");
          if (analyzeBtn) analyzeBtn.click();
        }
      }
    }
  } catch (_) {
    // Clipboard permission denied or unavailable
  }
}

export function initClipboardWatcher(urlInputEl) {
  // Check when window gains focus (e.g. user returns from TikTok / Instagram)
  window.addEventListener("focus", () => {
    checkClipboardForMediaUrl(urlInputEl, false);
  });

  // Check on Capacitor resume event
  document.addEventListener("resume", () => {
    checkClipboardForMediaUrl(urlInputEl, false);
  });

  // Manual Paste Button
  const pasteBtn = document.getElementById("composerPasteBtn");
  if (pasteBtn && urlInputEl) {
    pasteBtn.addEventListener("click", async () => {
      try {
        let text = "";
        if (window.Capacitor?.Plugins?.Clipboard) {
          const res = await window.Capacitor.Plugins.Clipboard.read();
          text = res?.value || "";
        } else if (navigator.clipboard?.readText) {
          text = await navigator.clipboard.readText();
        }
        if (text) {
          urlInputEl.value = cleanUrl(text);
          urlInputEl.dispatchEvent(new Event("input", { bubbles: true }));
          triggerHaptic("light");
          showToast("Pasted from clipboard");
        }
      } catch (e) {
        showToast("Unable to read clipboard", "warning");
      }
    });
  }
}
