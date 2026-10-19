// public/js/modules/batchManager.js
import { cleanUrl } from "../utils/urlUtils.js";
import { analyzeUrl } from "../scrapers/index.js";
import { resolveDownloadUrl, needsAsyncResolving } from "../downloader/resolver.js";
import { saveMediaFile } from "../downloader/storage.js";
import { sanitizeFilename, getMediaTargetDirectory } from "../downloader/filename.js";
import { postProcessDownload } from "../downloader/postProcess.js";
import { showToast, triggerHaptic } from "../utils/index.js";
import { updateDownloadBubble } from "../ui/downloadBubble.js";

class BatchQueueManager {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.queue = [];
    this.activeWorkers = 0;
    this.isPaused = false;
    this.tasks = new Map();
  }

  enqueueLinks(urls) {
    const valid = urls
      .map((u) => cleanUrl(u))
      .filter((u) => u.startsWith("http"));

    valid.forEach((url) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const task = {
        id: taskId,
        url,
        title: url,
        progress: 0,
        status: "queued", // queued, running, completed, error, cancelled
      };
      this.tasks.set(taskId, task);
      this.queue.push(task);
    });

    this.processQueue();
    updateDownloadBubble(this.getStats());
    showToast(`Added ${valid.length} items to batch queue`, "info");
  }

  getStats() {
    let completed = 0;
    let running = 0;
    let total = this.tasks.size;

    this.tasks.forEach((t) => {
      if (t.status === "completed") completed++;
      if (t.status === "running") running++;
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      completed,
      running,
      percent,
      tasks: Array.from(this.tasks.values()),
    };
  }

  async processQueue() {
    if (this.isPaused) return;

    while (this.activeWorkers < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task || task.status === "cancelled") continue;

      this.activeWorkers++;
      task.status = "running";
      updateDownloadBubble(this.getStats());

      this.executeTask(task).finally(() => {
        this.activeWorkers--;
        updateDownloadBubble(this.getStats());
        this.processQueue();
      });
    }
  }

  async executeTask(task) {
    try {
      task.progress = 10;
      updateDownloadBubble(this.getStats());

      const data = await analyzeUrl(task.url);
      task.title = data.title || task.url;

      const format = data.formats?.[0] || data.photos?.[0];
      if (!format) throw new Error("No downloadable stream found");

      let downloadUrl = format.url;
      if (needsAsyncResolving(downloadUrl)) {
        downloadUrl = await resolveDownloadUrl({
          url: downloadUrl,
          updateProgress: (p) => {
            task.progress = p;
            updateDownloadBubble(this.getStats());
          },
        });
      }

      task.progress = 50;
      updateDownloadBubble(this.getStats());

      // Fetch file buffer
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const blob = await res.blob();

      task.progress = 85;
      updateDownloadBubble(this.getStats());

      const ext = format.ext || "mp4";
      const filename = `${sanitizeFilename(data.title)}.${ext}`;
      const subfolder = getMediaTargetDirectory(format.type || "video");

      await saveMediaFile({
        data: blob,
        filename,
        subfolder,
        mimeType: blob.type || "video/mp4",
      });

      await postProcessDownload({
        title: data.title,
        sourceUrl: task.url,
        platform: data.platform,
        filename,
        fileSize: blob.size,
        mediaType: format.type || "video",
        thumbnailUrl: data.thumbnail,
      });

      task.progress = 100;
      task.status = "completed";
      triggerHaptic("light");
    } catch (err) {
      console.warn(`[Batch Task Error] ${task.url}:`, err);
      task.status = "error";
      task.error = err.message;
    }
  }
}

export const batchQueue = new BatchQueueManager(3);
