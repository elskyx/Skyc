// public/js/modules/settings.js
import { setBgAnimationMode } from "./bgAnimation.js";
import { checkOtaScraperUpdate } from "./updateScrapers.js";
import { checkForAppUpdates, APP_CURRENT_VERSION } from "./update.js";
import { isPinLockEnabled, setStoredPin } from "./authManager.js";
import { showToast, triggerHaptic } from "../utils/index.js";

export function initSettings() {
  // Theme Switcher
  const themeBtns = document.querySelectorAll(".theme-chip-btn");
  const currentTheme = localStorage.getItem("skyc_theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);

  themeBtns.forEach((btn) => {
    const val = btn.getAttribute("data-theme-val");
    btn.classList.toggle("active", val === currentTheme);

    btn.addEventListener("click", () => {
      themeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.documentElement.setAttribute("data-theme", val);
      localStorage.setItem("skyc_theme", val);
      triggerHaptic("light");
    });
  });

  // Ambient Animation Mode
  const animBtns = document.querySelectorAll(".anim-chip-btn");
  const currentAnim = localStorage.getItem("skyc_ambient_animation") || "fireflies";

  animBtns.forEach((btn) => {
    const val = btn.getAttribute("data-anim-val");
    btn.classList.toggle("active", val === currentAnim);

    btn.addEventListener("click", () => {
      animBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setBgAnimationMode(val);
      triggerHaptic("light");
    });
  });

  // PIN Lock Toggle
  const pinToggle = document.getElementById("pinLockToggle");
  if (pinToggle) {
    pinToggle.checked = isPinLockEnabled();
    pinToggle.addEventListener("change", () => {
      if (pinToggle.checked) {
        const pin = prompt("Enter a 4-digit PIN to secure your app:");
        if (pin && /^\d{4}$/.test(pin)) {
          setStoredPin(pin);
          showToast("PIN lock enabled", "success");
        } else {
          pinToggle.checked = false;
          showToast("Invalid PIN. Must be exactly 4 digits.", "warning");
        }
      } else {
        setStoredPin("");
        showToast("PIN lock disabled", "info");
      }
      triggerHaptic("medium");
    });
  }

  // Header Spoofing Toggle
  const spoofToggle = document.getElementById("headerSpoofToggle");
  if (spoofToggle) {
    spoofToggle.checked = localStorage.getItem("skyc_header_spoofing") !== "false";
    spoofToggle.addEventListener("change", () => {
      localStorage.setItem("skyc_header_spoofing", spoofToggle.checked ? "true" : "false");
      triggerHaptic("light");
    });
  }

  // Check OTA Scraper Update Button
  const otaBtn = document.getElementById("checkOtaScraperBtn");
  if (otaBtn) {
    otaBtn.addEventListener("click", async () => {
      otaBtn.disabled = true;
      otaBtn.textContent = "Checking...";
      await checkOtaScraperUpdate(true);
      otaBtn.disabled = false;
      otaBtn.textContent = "Check Scraper Patch";
    });
  }

  // Check App Release Button
  const appUpdateBtn = document.getElementById("checkAppUpdateBtn");
  if (appUpdateBtn) {
    appUpdateBtn.addEventListener("click", async () => {
      appUpdateBtn.disabled = true;
      appUpdateBtn.textContent = "Checking...";
      await checkForAppUpdates(true);
      appUpdateBtn.disabled = false;
      appUpdateBtn.textContent = "Check for Updates";
    });
  }

  // Set App Version in UI
  const versionEl = document.getElementById("settingsAppVersion");
  if (versionEl) versionEl.textContent = `v${APP_CURRENT_VERSION}`;
}
