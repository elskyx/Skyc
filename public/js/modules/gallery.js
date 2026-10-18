// public/js/modules/gallery.js
import { getHistory } from "./history.js";
import { formatBytes, formatRelativeTime, showToast, triggerHaptic } from "../utils/index.js";
import { openPlayerModal } from "../components/player.js";

let currentGalleryFilter = "all";
let currentSearchQuery = "";

export function initGallery() {
  // Filter chips
  document.querySelectorAll(".gallery-filters-row .chip-filter").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".gallery-filters-row .chip-filter").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentGalleryFilter = chip.getAttribute("data-filter") || "all";
      triggerHaptic("light");
      renderGallery();
    });
  });

  // Search input
  const searchInput = document.getElementById("gallerySearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderGallery();
    });
  }

  renderGallery();
}

export function refreshGalleryPage() {
  renderGallery();
}

export function renderGallery() {
  const container = document.getElementById("galleryGridContainer");
  const statsEl = document.getElementById("galleryItemsCount");
  if (!container) return;

  const history = getHistory();
  let filtered = history;

  // Filter by media type
  if (currentGalleryFilter !== "all") {
    filtered = filtered.filter((item) => {
      if (currentGalleryFilter === "videos") return item.mediaType === "video";
      if (currentGalleryFilter === "music") return item.mediaType === "audio" || item.mediaType === "music";
      if (currentGalleryFilter === "photos") return item.mediaType === "photo";
      if (currentGalleryFilter === "pdf") return item.mediaType === "pdf";
      return true;
    });
  }

  // Filter by search query
  if (currentSearchQuery) {
    filtered = filtered.filter((item) => {
      const matchTitle = (item.title || "").toLowerCase().includes(currentSearchQuery);
      const matchFile = (item.filename || "").toLowerCase().includes(currentSearchQuery);
      const matchPlat = (item.platform || "").toLowerCase().includes(currentSearchQuery);
      return matchTitle || matchFile || matchPlat;
    });
  }

  if (statsEl) {
    statsEl.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="gallery-empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div class="empty-state-title">No media found</div>
        <div class="empty-state-desc">Your downloaded videos, songs, and photos will appear in this offline gallery.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (item) => `
    <div class="gallery-item-card" data-id="${item.id}">
      <div class="gallery-thumb-container">
        <span class="gallery-type-badge">${(item.mediaType || "media").toUpperCase()}</span>
        ${
          item.thumbnailUrl
            ? `<img src="${item.thumbnailUrl}" class="gallery-thumb-img" alt="${item.title}" loading="lazy"/>`
            : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--text-muted)">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>`
        }
      </div>
      <div class="gallery-meta-box">
        <div class="gallery-filename" title="${item.title}">${item.title}</div>
        <div class="gallery-submeta">
          <span>${formatBytes(item.fileSize)}</span>
          <span>${formatRelativeTime(item.timestamp)}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Attach click handler to play/view
  container.querySelectorAll(".gallery-item-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const item = history.find((h) => h.id === id);
      if (item) {
        openPlayerModal(item);
      }
    });
  });
}
