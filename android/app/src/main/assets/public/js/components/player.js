// public/js/components/player.js
import { formatDuration, triggerHaptic } from "../utils/index.js";

let activeMediaItem = null;

export function openPlayerModal(item) {
  activeMediaItem = item;
  const modal = document.getElementById("playerModal");
  const title = document.getElementById("playerModalTitle");
  const videoEl = document.getElementById("modalVideoPlayer");
  const audioEl = document.getElementById("modalAudioPlayer");

  if (title) title.textContent = item.title;

  if (item.mediaType === "audio" || item.mediaType === "music") {
    if (videoEl) videoEl.style.display = "none";
    if (audioEl) {
      audioEl.style.display = "block";
      audioEl.src = item.sourceUrl || item.filename;
      audioEl.play().catch(() => {});
    }
  } else {
    if (audioEl) audioEl.style.display = "none";
    if (videoEl) {
      videoEl.style.display = "block";
      videoEl.src = item.sourceUrl || item.filename;
      videoEl.play().catch(() => {});
    }
  }

  if (modal) modal.classList.add("active");
  triggerHaptic("light");
}

export function closePlayerModal() {
  const modal = document.getElementById("playerModal");
  const videoEl = document.getElementById("modalVideoPlayer");
  const audioEl = document.getElementById("modalAudioPlayer");

  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }
  if (audioEl) {
    audioEl.pause();
    audioEl.removeAttribute("src");
    audioEl.load();
  }

  if (modal) modal.classList.remove("active");
  activeMediaItem = null;
}

export function initPlayerControls() {
  const closeBtn = document.getElementById("playerCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closePlayerModal);
  }

  const modal = document.getElementById("playerModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closePlayerModal();
    });
  }
}
