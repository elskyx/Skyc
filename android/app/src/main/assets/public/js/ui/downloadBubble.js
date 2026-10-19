// public/js/ui/downloadBubble.js
import { triggerHaptic } from "../utils/index.js";

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 22; // r=22 -> ~138.23

export function initDownloadBubble() {
  const triggerBtn = document.getElementById("bubbleTriggerBtn");
  const tray = document.getElementById("bubbleDropupTray");

  if (triggerBtn && tray) {
    triggerBtn.addEventListener("click", () => {
      tray.classList.toggle("open");
      triggerHaptic("light");
    });
  }

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const widget = document.getElementById("floatingDownloadWidget");
    if (widget && !widget.contains(e.target) && tray?.classList.contains("open")) {
      tray.classList.remove("open");
    }
  });
}

/**
 * Updates progress ring, badge count, and tasks in dropup tray
 */
export function updateDownloadBubble(stats) {
  const widget = document.getElementById("floatingDownloadWidget");
  const circleBar = document.getElementById("bubbleProgressBar");
  const badge = document.getElementById("bubbleBadgeCount");
  const taskList = document.getElementById("trayTasksList");

  if (!widget) return;

  const activeCount = stats.running || 0;
  const isWorking = stats.total > 0 && stats.completed < stats.total;

  if (isWorking || activeCount > 0) {
    widget.style.display = "flex";
  } else {
    // Keep visible briefly then fade if all complete
    if (stats.completed > 0) {
      setTimeout(() => {
        if (stats.running === 0) widget.style.display = "none";
      }, 5000);
    } else {
      widget.style.display = "none";
    }
  }

  // Update circular progress SVG
  if (circleBar) {
    const offset = CIRCLE_CIRCUMFERENCE - (stats.percent / 100) * CIRCLE_CIRCUMFERENCE;
    circleBar.style.strokeDashoffset = offset;
    circleBar.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
  }

  // Update badge count
  if (badge) {
    badge.textContent = activeCount > 0 ? activeCount : (stats.total - stats.completed);
    badge.style.display = (stats.total - stats.completed) > 0 ? "flex" : "none";
  }

  // Render tasks in tray
  if (taskList && stats.tasks) {
    taskList.innerHTML = stats.tasks
      .map(
        (t) => `
      <div class="tray-task-item">
        <div class="tray-task-header">
          <div class="tray-task-name" title="${t.title}">${t.title}</div>
          <div class="tray-task-status">${t.status.toUpperCase()} (${t.progress}%)</div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${t.progress}%"></div>
        </div>
      </div>
    `
      )
      .join("");
  }
}
