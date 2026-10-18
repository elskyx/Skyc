// src-scrapers/platforms/terabox.js

export async function scrapeTeraBox(url, fetchClient) {
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://terabox-downloader.com/api/get-info",
      headers: {
        "Content-Type": "application/json",
      },
      data: { url },
    }, "TeraBoxAPI");

    if (res?.download_url || res?.direct_link) {
      const dl = res.download_url || res.direct_link;
      return {
        platform: "terabox",
        title: res.filename || "TeraBox File",
        author: "TeraBox Shared Storage",
        thumbnail: res.thumb || "",
        duration: 0,
        formats: [
          {
            id: "terabox_direct",
            label: `Direct Download (${res.size || "Original"})`,
            quality: res.size || "Original",
            type: "video",
            ext: res.filename?.split(".").pop() || "mp4",
            url: dl,
          }
        ],
        photos: [],
        hasPdfOption: false,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] TeraBox error:", err);
  }

  throw new Error("TeraBox link could not be resolved.");
}
