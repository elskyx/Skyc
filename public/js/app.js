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
import { initUpdateSystem } from "./modules/update.js";
import { batchQueue } from "./modules/batchManager.js";
import { triggerHaptic, showToast } from "./utils/index.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Booting Skyc Media Downloader...");

  const safeInit = (name, fn) => {
    try {
      fn();
    } catch (err) {
      console.error(`[Skyc Boot] Failed to init ${name}:`, err);
    }
  };

  // 1. Live Background Ambient Animation
  safeInit("bgAnimation", initBgAnimation);

  // 2. Navigation Tabs Router
  safeInit("navRouter", initNavigationRouter);

  // 3. Controllers & Features
  safeInit("downloadController", initDownloadController);
  safeInit("gallery", initGallery);
  safeInit("history", renderHistory);
  safeInit("settings", initSettings);
  safeInit("authListeners", initAuthListeners);
  safeInit("playerControls", initPlayerControls);
  safeInit("downloadBubble", initDownloadBubble);

  // 4. Clipboard Intent Watcher
  const urlInput = document.getElementById("composerUrlInput");
  safeInit("clipboardWatcher", () => initClipboardWatcher(urlInput));

  // 5. Batch Mode Modal Listeners
  safeInit("batchModal", initBatchModal);

  // 6. History Action Buttons
  const clearHistBtn = document.getElementById("clearHistoryBtn");
  if (clearHistBtn) clearHistBtn.addEventListener("click", clearHistory);

  const exportHistBtn = document.getElementById("exportHistoryBtn");
  if (exportHistBtn) exportHistBtn.addEventListener("click", exportHistoryJson);

  // 7. 21st.dev Mouse Spotlight & 3D Tilt Motion
  safeInit("spotlightMotion", initSpotlightAnd3DTilt);

  // 8. Header Theme Toggle Switcher
  safeInit("headerThemeToggle", initHeaderThemeToggle);

  // 9. Update & Notification Engine (Monitors GitHub Releases & Repo Commits)
  safeInit("updateSystem", initUpdateSystem);

  // 10. Background OTA Scraper Patch Check (silent)
  setTimeout(() => {
    safeInit("otaCheck", () => checkOtaScraperUpdate(false));
  }, 3500);
});

function initHeaderThemeToggle() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem("skyc_theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("skyc_theme", newTheme);

    // Sync theme settings chips
    document.querySelectorAll(".theme-chip-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-theme-val") === newTheme);
    });

    triggerHaptic("light");
  });
}

function initSpotlightAnd3DTilt() {
  const spotlightElements = document.querySelectorAll("[data-spotlight], .claude-url-composer, .claude-card");

  spotlightElements.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);

      // 3D perspective tilt on desktop viewport
      if (window.innerWidth > 768 && el.classList.contains("claude-url-composer")) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;
      }
    });

    el.addEventListener("mouseleave", () => {
      if (el.classList.contains("claude-url-composer")) {
        el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      }
    });
  });

  // Clicking platform cards or pills gives instant tactile feedback, updates active card style, and focuses input
  const platformElements = document.querySelectorAll(".platform-card, .platform-pill");
  const composerInput = document.getElementById("composerUrlInput");
  platformElements.forEach((item) => {
    item.addEventListener("click", () => {
      const platformKey = item.getAttribute("data-platform");
      const name = item.querySelector(".platform-card-name")?.textContent || item.querySelector("span")?.textContent || item.textContent.trim();

      // Dynamic Active Style: remove from all cards and assign to selected platform
      if (platformKey) {
        document.querySelectorAll(".platform-card").forEach((card) => {
          if (card.getAttribute("data-platform") === platformKey) {
            card.classList.add("platform-card-active-style");
          } else {
            card.classList.remove("platform-card-active-style");
          }
        });
      }

      // If clicked from another view (e.g. Platforms view), switch to home tab
      const homeTab = document.querySelector('.nav-tab-btn[data-tab="home"]');
      const homeView = document.getElementById("view-home");
      if (homeView && !homeView.classList.contains("active") && homeTab) {
        homeTab.click();
      }

      if (composerInput) {
        composerInput.focus();
        showToast(`Ready for ${name} link • Paste URL`, "info");
      }
      triggerHaptic("light");

      // Tactile press animation
      item.classList.add("is-pressed");
      setTimeout(() => item.classList.remove("is-pressed"), 180);

      // Scroll composer into view
      const composerWrapper = document.querySelector(".composer-perspective-wrapper");
      if (composerWrapper) {
        composerWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

  // Circular Floating Action Button with Official Skyc Capsule Logo (Reference Design)
  const logoFab = document.getElementById("skycLogoFab");
  if (logoFab) {
    logoFab.addEventListener("click", () => {
      triggerHaptic("medium");
      showToast("Skyc Core Engine • 16+ Zero-Cloud Extractors", "info");
      logoFab.classList.add("is-spinning");
      setTimeout(() => logoFab.classList.remove("is-spinning"), 600);

      const homeTab = document.querySelector('.nav-tab-btn[data-tab="home"]');
      const homeView = document.getElementById("view-home");
      if (homeView && !homeView.classList.contains("active") && homeTab) {
        homeTab.click();
      }

      const platformsSec = document.getElementById("supportedPlatformsSection");
      if (platformsSec) {
        platformsSec.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
}

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
