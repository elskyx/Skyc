// public/js/utils/index.js

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";

export function getUserAgent() {
  const custom = localStorage.getItem("skyc_custom_user_agent");
  if (custom && custom.trim()) return custom.trim();
  return DEFAULT_USER_AGENT;
}

/**
 * Trigger subtle haptic feedback on Android/mobile
 */
export function triggerHaptic(type = "light") {
  try {
    if (window.Capacitor?.Plugins?.Haptics) {
      if (type === "medium") {
        window.Capacitor.Plugins.Haptics.impact({ style: "MEDIUM" });
      } else if (type === "heavy" || type === "error") {
        window.Capacitor.Plugins.Haptics.notification({ type: "ERROR" });
      } else {
        window.Capacitor.Plugins.Haptics.impact({ style: "LIGHT" });
      }
    } else if (navigator.vibrate) {
      if (type === "medium") navigator.vibrate(25);
      else if (type === "heavy" || type === "error") navigator.vibrate([40, 30, 40]);
      else navigator.vibrate(12);
    }
  } catch (_) {}
}

/**
 * Display non-intrusive floating toast message
 */
export function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  triggerHaptic("light");

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const sec = Math.floor(seconds);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const h = Math.floor(m / 60);
  const remM = m % 60;

  if (h > 0) {
    return `${h}:${remM < 10 ? "0" : ""}${remM}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Format relative time (e.g. 5m ago, 2d ago)
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const sec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
