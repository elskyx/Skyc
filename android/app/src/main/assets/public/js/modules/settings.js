// public/js/modules/settings.js
import { setBgAnimationMode } from "./bgAnimation.js";
import { checkOtaScraperUpdate } from "./updateScrapers.js";
import {
  checkForAppUpdates,
  updateSettingsViewStatus,
  requestNotificationPermission,
  APP_CURRENT_VERSION,
} from "./update.js";
import { isPinLockEnabled, setStoredPin } from "./authManager.js";
import { showToast, triggerHaptic } from "../utils/index.js";

export function initSettings() {
  // 1. Theme Switcher
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

  // 2. Ambient Animation Mode
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

  // 3. PIN Lock Toggle
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

  // 4. Header Spoofing Toggle
  const spoofToggle = document.getElementById("headerSpoofToggle");
  if (spoofToggle) {
    spoofToggle.checked = localStorage.getItem("skyc_header_spoofing") !== "false";
    spoofToggle.addEventListener("change", () => {
      localStorage.setItem("skyc_header_spoofing", spoofToggle.checked ? "true" : "false");
      triggerHaptic("light");
    });
  }

  // 5. Custom Cobalt Resolver Settings
  const cobaltInput = document.getElementById("customCobaltInput");
  const saveCobaltBtn = document.getElementById("saveCobaltBtn");
  if (cobaltInput) {
    cobaltInput.value = localStorage.getItem("skyc_cobalt_instance") || "";
  }
  if (saveCobaltBtn && cobaltInput) {
    saveCobaltBtn.addEventListener("click", () => {
      const val = cobaltInput.value.trim();
      if (!val) {
        localStorage.removeItem("skyc_cobalt_instance");
        showToast("Custom Cobalt instance cleared (using default nodes)", "info");
      } else if (!val.startsWith("http://") && !val.startsWith("https://")) {
        showToast("Please enter a valid URL starting with https://", "warning");
      } else {
        localStorage.setItem("skyc_cobalt_instance", val);
        showToast("Custom Cobalt instance saved", "success");
      }
      triggerHaptic("medium");
    });
  }

  // 6. Auto-Check Updates Toggle
  const autoCheckToggle = document.getElementById("autoCheckUpdatesToggle");
  if (autoCheckToggle) {
    autoCheckToggle.checked = localStorage.getItem("skyc_auto_check_updates") !== "false";
    autoCheckToggle.addEventListener("change", () => {
      localStorage.setItem("skyc_auto_check_updates", autoCheckToggle.checked ? "true" : "false");
      triggerHaptic("light");
      showToast(autoCheckToggle.checked ? "Auto-check enabled" : "Auto-check disabled", "info");
    });
  }

  // 7. Notify on Repo Commits Toggle
  const notifyRepoToggle = document.getElementById("notifyRepoCommitsToggle");
  if (notifyRepoToggle) {
    notifyRepoToggle.checked = localStorage.getItem("skyc_notify_repo_commits") !== "false";
    notifyRepoToggle.addEventListener("change", () => {
      localStorage.setItem("skyc_notify_repo_commits", notifyRepoToggle.checked ? "true" : "false");
      triggerHaptic("light");
      showToast(
        notifyRepoToggle.checked ? "Repo commit notifications enabled" : "Repo commit notifications disabled",
        "info"
      );
    });
  }

  // 8. System Push Notifications Button
  const notifBtn = document.getElementById("enableNotificationsBtn");
  const notifDesc = document.getElementById("notificationPermissionDesc");
  if (notifBtn) {
    updateNotificationUiState(notifBtn, notifDesc);
    notifBtn.addEventListener("click", async () => {
      const granted = await requestNotificationPermission();
      updateNotificationUiState(notifBtn, notifDesc);
    });
  }

  // 9. Check OTA Scraper Update Button
  const otaBtn = document.getElementById("checkOtaScraperBtn");
  if (otaBtn) {
    otaBtn.addEventListener("click", async () => {
      otaBtn.disabled = true;
      otaBtn.textContent = "Checking...";
      await checkOtaScraperUpdate(true);
      otaBtn.disabled = false;
      otaBtn.textContent = "Check Scraper Patch";
      updateSettingsViewStatus();
    });
  }

  // 10. Check App Release & Repo Update Button
  const appUpdateBtn = document.getElementById("checkAppUpdateBtn");
  if (appUpdateBtn) {
    appUpdateBtn.addEventListener("click", async () => {
      appUpdateBtn.disabled = true;
      appUpdateBtn.textContent = "Checking...";
      await checkForAppUpdates({ manual: true });
      appUpdateBtn.disabled = false;
      appUpdateBtn.textContent = "Check for Updates";
      updateSettingsViewStatus();
    });
  }

  // 11. Initial UI update for Version & Status
  updateSettingsViewStatus();
}

function updateNotificationUiState(btn, desc) {
  if (!("Notification" in window)) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Unsupported";
    }
    if (desc) desc.textContent = "Notifications not supported on this browser";
    return;
  }

  if (Notification.permission === "granted") {
    if (btn) {
      btn.textContent = "Enabled ✓";
      btn.classList.add("btn-ghost");
      btn.classList.remove("btn-secondary");
      btn.disabled = true;
    }
    if (desc) desc.textContent = "Alerts enabled for new releases and repo patches";
  } else if (Notification.permission === "denied") {
    if (btn) {
      btn.textContent = "Blocked ✕";
      btn.disabled = true;
    }
    if (desc) desc.textContent = "Permission blocked in browser settings";
  } else {
    if (btn) {
      btn.textContent = "Enable";
      btn.disabled = false;
    }
    if (desc) desc.textContent = "Send desktop or device alerts for updates";
  }
}
