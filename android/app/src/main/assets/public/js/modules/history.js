// public/js/modules/history.js
import { formatBytes, formatRelativeTime, showToast, triggerHaptic } from "../utils/index.js";
import { getPlatformDisplayName } from "../utils/urlUtils.js";

const HISTORY_KEY = "skyc_download_history";

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (_) {}
}

export function addToHistory(item) {
  const history = getHistory();
  // Prepend new item
  history.unshift(item);
  // Cap history at 500 items
  if (history.length > 500) history.pop();
  saveHistory(history);
  renderHistory();
}

export function deleteHistoryItem(id) {
  let history = getHistory();
  history = history.filter((item) => item.id !== id);
  saveHistory(history);
  renderHistory();
  triggerHaptic("light");
  showToast("Item deleted from history");
}

export function clearHistory() {
  if (confirm("Are you sure you want to clear your entire download history?")) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    triggerHaptic("medium");
    showToast("History cleared");
  }
}

export function getHistoryStats() {
  const history = getHistory();
  const totalCount = history.length;
  let totalBytes = 0;

  history.forEach((h) => {
    totalBytes += h.fileSize || 0;
  });

  return {
    totalCount,
    totalBytes,
    formattedSize: formatBytes(totalBytes),
  };
}

export function exportHistoryJson() {
  const history = getHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `skyc_history_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("History exported as JSON");
}

export function renderHistory() {
  const historyContainer = document.getElementById("historyListContainer");
  const statsCountEl = document.getElementById("historyStatCount");
  const statsSizeEl = document.getElementById("historyStatSize");

  const stats = getHistoryStats();
  if (statsCountEl) statsCountEl.textContent = stats.totalCount;
  if (statsSizeEl) statsSizeEl.textContent = stats.formattedSize;

  if (!historyContainer) return;

  const history = getHistory();
  if (history.length === 0) {
    historyContainer.innerHTML = `
      <div class="gallery-empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="empty-state-title">No download history yet</div>
        <div class="empty-state-desc">Media you analyze and download will be recorded here for instant access.</div>
      </div>
    `;
    return;
  }

  historyContainer.innerHTML = history
    .map(
      (item) => `
    <div class="history-item-row" data-id="${item.id}">
      <div class="history-info-left">
        <div class="history-platform-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
        </div>
        <div class="history-texts-col">
          <div class="history-item-title" title="${item.title}">${item.title}</div>
          <div class="history-item-sub">
            <span class="badge badge-terracotta">${getPlatformDisplayName(item.platform)}</span>
            <span>${item.fileSize ? formatBytes(item.fileSize) : (item.savedPath ? "Saved" : "Downloaded")}</span>
            <span>•</span>
            <span>${formatRelativeTime(item.timestamp)}</span>
            ${item.savedPath ? `<span class="history-path-badge" title="${item.savedPath}">📁 ${item.savedPath.split(/[\\/]/).pop()}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="history-actions-right">
        ${
          item.savedPath
            ? `
        <button class="btn-icon open-folder-btn" title="Open file in Explorer / Folder" data-path="${item.savedPath.replace(/"/g, "&quot;")}">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
        </button>`
            : ""
        }
        <button class="btn-icon delete-history-btn" title="Delete from history" data-id="${item.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Attach open folder buttons
  historyContainer.querySelectorAll(".open-folder-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const filePath = btn.getAttribute("data-path");
      if (!filePath) return;

      if (window.__TAURI__?.core?.invoke) {
        try {
          await window.__TAURI__.core.invoke("open_in_explorer", { path: filePath });
          triggerHaptic("light");
        } catch (err) {
          console.warn("[Skyc] Unable to open explorer:", err);
          showToast(`File: ${filePath}`, "info");
        }
      } else {
        showToast(`File: ${filePath}`, "info");
      }
    });
  });

  // Attach delete buttons
  historyContainer.querySelectorAll(".delete-history-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      deleteHistoryItem(id);
    });
  });
}
