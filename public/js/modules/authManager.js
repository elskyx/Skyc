// public/js/modules/authManager.js
import { triggerHaptic, showToast } from "../utils/index.js";

let currentPinInput = "";
let pendingAuthCallback = null;

export function isPinLockEnabled() {
  return localStorage.getItem("skyc_pin_lock_enabled") === "true";
}

export function getStoredPin() {
  return localStorage.getItem("skyc_stored_pin") || "";
}

export function setStoredPin(pin) {
  if (pin && pin.length === 4) {
    localStorage.setItem("skyc_stored_pin", pin);
    localStorage.setItem("skyc_pin_lock_enabled", "true");
  } else {
    localStorage.removeItem("skyc_stored_pin");
    localStorage.setItem("skyc_pin_lock_enabled", "false");
  }
}

/**
 * Prompts user for 4-digit PIN if lock is enabled
 */
export function verifyAuth(targetName = "Content", callback = () => {}) {
  if (!isPinLockEnabled() || !getStoredPin()) {
    callback(true);
    return;
  }

  // Check session unlock
  const sessionUnlocked = sessionStorage.getItem("skyc_session_unlocked") === "true";
  if (sessionUnlocked) {
    callback(true);
    return;
  }

  pendingAuthCallback = callback;
  openPinModal(targetName);
}

function openPinModal(targetName) {
  currentPinInput = "";
  updatePinDots();

  const modal = document.getElementById("pinLockModal");
  const title = document.getElementById("pinLockTitle");
  if (title) title.textContent = `Unlock ${targetName}`;
  if (modal) modal.classList.add("active");
}

function closePinModal(success = false) {
  const modal = document.getElementById("pinLockModal");
  if (modal) modal.classList.remove("active");
  currentPinInput = "";
  updatePinDots();

  if (pendingAuthCallback) {
    pendingAuthCallback(success);
    pendingAuthCallback = null;
  }
}

function updatePinDots() {
  const dots = document.querySelectorAll(".pin-dot");
  dots.forEach((dot, idx) => {
    dot.classList.toggle("filled", idx < currentPinInput.length);
  });
}

export function handlePinKeyPress(digit) {
  if (currentPinInput.length >= 4) return;
  currentPinInput += digit;
  triggerHaptic("light");
  updatePinDots();

  if (currentPinInput.length === 4) {
    setTimeout(validateEnteredPin, 100);
  }
}

export function handlePinBackspace() {
  if (currentPinInput.length > 0) {
    currentPinInput = currentPinInput.slice(0, -1);
    triggerHaptic("light");
    updatePinDots();
  }
}

function validateEnteredPin() {
  const stored = getStoredPin();
  if (currentPinInput === stored) {
    triggerHaptic("medium");
    sessionStorage.setItem("skyc_session_unlocked", "true");
    closePinModal(true);
  } else {
    triggerHaptic("error");
    showToast("Incorrect PIN code", "danger");
    const container = document.querySelector(".pin-pad-container");
    if (container) {
      container.style.animation = "shake 0.3s ease";
      setTimeout(() => (container.style.animation = ""), 300);
    }
    currentPinInput = "";
    updatePinDots();
  }
}

export function initAuthListeners() {
  document.querySelectorAll(".pin-key-btn[data-key]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      if (key === "backspace") {
        handlePinBackspace();
      } else {
        handlePinKeyPress(key);
      }
    });
  });

  const closeBtn = document.getElementById("pinLockCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closePinModal(false));
  }
}
