// public/js/app.js
import { initBgAnimation } from "./modules/bgAnimation.js";
import { initDownloadController } from "./modules/download.js";
import { initGallery } from "./modules/gallery.js";
import { renderHistory, exportHistoryJson, clearHistory } from "./modules/history.js";
import { initSettings } from "./modules/settings.js";
import { initAuthListeners, verifyAuth } from "./modules/authManager.js";
import { initClipboardWatcher } from "./modules/intents.js";
import { initDownloadBubble } from "./ui/downloadBubble.js";
import { initPlayerControls } from "./components/player.js";
import { checkOtaScraperUpdate } from "./modules/updateScrapers.js";
import { batchQueue } from "./modules/batchManager.js";
import { triggerHaptic, showToast } from "./utils/index.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Booting Skyc Media Downloader...");

  // 1. Live Background Ambient Animation
  initBgAnimation();

  // 2. Navigation Tabs Router
  initNavigationRouter();

  // 3. Controllers & Features
  initDownloadController();
  initGallery();
  renderHistory();
  initSettings();
  initAuthListeners();
  initPlayerControls();
  initDownloadBubble();

  // 4. Clipboard Intent Watcher
  const urlInput = document.getElementById("composerUrlInput");
  initClipboardWatcher(urlInput);

  // 5. Batch Mode Modal Listeners
  initBatchModal();

  // 6. History Action Buttons
  const clearHistBtn = document.getElementById("clearHistoryBtn");
  if (clearHistBtn) clearHistBtn.addEventListener("click", clearHistory);

  const exportHistBtn = document.getElementById("exportHistoryBtn");
  if (exportHistBtn) exportHistBtn.addEventListener("click", exportHistoryJson);

  // 7. Background OTA Scraper Patch Check (silent)
  setTimeout(() => {
    checkOtaScraperUpdate(false);
  }, 3500);
});

function initNavigationRouter() {
  const tabs = document.querySelectorAll(".nav-tab-btn");
  const pages = document.querySelectorAll(".view-page");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetView = tab.getAttribute("data-tab");

      // Verify PIN lock before opening sensitive tabs
      if (targetView === "gallery" || targetView === "history") {
        verifyAuth(targetView.toUpperCase(), (unlocked) => {
          if (unlocked) switchView(targetView);
        });
      } else {
        switchView(targetView);
      }
    });
  });

  function switchView(target) {
    tabs.forEach((t) => t.classList.toggle("active", t.getAttribute("data-tab") === target));
    pages.forEach((p) => p.classList.toggle("active", p.id === `view-${target}`));
    triggerHaptic("light");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function initBatchModal() {
  const batchToggleBtn = document.getElementById("batchToggleBtn");
  const batchModal = document.getElementById("batchModal");
  const batchCloseBtn = document.getElementById("batchModalCloseBtn");
  const batchSubmitBtn = document.getElementById("batchSubmitBtn");
  const batchTextarea = document.getElementById("batchUrlsTextarea");

  if (batchToggleBtn && batchModal) {
    batchToggleBtn.addEventListener("click", () => {
      batchModal.classList.add("active");
      triggerHaptic("light");
    });
  }

  if (batchCloseBtn && batchModal) {
    batchCloseBtn.addEventListener("click", () => {
      batchModal.classList.remove("active");
    });
  }

  if (batchSubmitBtn && batchTextarea) {
    batchSubmitBtn.addEventListener("click", () => {
      const rawText = batchTextarea.value.trim();
      if (!rawText) {
        showToast("Please enter at least one URL", "warning");
        return;
      }

      const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
      batchQueue.enqueueLinks(lines);

      batchTextarea.value = "";
      batchModal?.classList.remove("active");
      triggerHaptic("medium");
    });
  }
}
