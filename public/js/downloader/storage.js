// public/js/downloader/storage.js
import { showToast } from "../utils/index.js";

/**
 * Saves a Blob or ArrayBuffer to the user's device filesystem
 */
export async function saveMediaFile({
  data,
  filename,
  subfolder = "Movies/Skyc",
  mimeType = "video/mp4",
  onProgress = () => {}
}) {
  // 1. Android Capacitor Environment
  if (window.Capacitor?.Plugins?.Filesystem) {
    try {
      const { Filesystem, Directory } = window.Capacitor.Plugins;

      // Convert Blob to Base64
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result;
          const base64 = res.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(data instanceof Blob ? data : new Blob([data], { type: mimeType }));
      });

      const fullPath = `${subfolder}/${filename}`;
      await Filesystem.writeFile({
        path: fullPath,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });

      return { success: true, path: fullPath };
    } catch (androidErr) {
      console.warn("[Skyc Storage] Capacitor Filesystem failed, falling back:", androidErr);
    }
  }

  // 2. Windows Tauri Desktop Environment
  if (window.__TAURI__?.core?.invoke) {
    try {
      const buffer = data instanceof ArrayBuffer ? data : await data.arrayBuffer();
      const bytes = Array.from(new Uint8Array(buffer));
      const res = await window.__TAURI__.core.invoke("save_media_file", {
        filename,
        subfolder,
        bytes
      });
      return { success: true, path: res };
    } catch (tauriErr) {
      console.warn("[Skyc Storage] Tauri native write failed:", tauriErr);
    }
  }

  // 3. Web Browser Fallback (Anchor Download)
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);

  return { success: true, path: filename };
}
