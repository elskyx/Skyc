// src-scrapers/platforms/facebook.js

export async function scrapeFacebook(url, fetchClient) {
  // Server 1: SnapSave API
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://snapsave.app/action.php?lang=en",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://snapsave.app/",
      },
      data: { url },
    }, "SnapSave");

    const html = typeof res === "string" ? res : (res?.data || JSON.stringify(res));
    const formats = [];

    // Extract HD video
    const hdMatch = html.match(/href="([^"]*(?:fbcdn\.net|\.mp4)[^"]*)"[^>]*>[\s\S]*?(?:HD|720p|1080p)/i);
    if (hdMatch) {
      formats.push({
        id: "fb_hd",
        label: "Facebook Video (HD)",
        quality: "HD 720p/1080p",
        type: "video",
        ext: "mp4",
        url: hdMatch[1],
      });
    }

    // Extract SD video
    const sdMatch = html.match(/href="([^"]*(?:fbcdn\.net|\.mp4)[^"]*)"/i);
    if (sdMatch && (!hdMatch || sdMatch[1] !== hdMatch[1])) {
      formats.push({
        id: "fb_sd",
        label: "Facebook Video (SD)",
        quality: "Standard SD",
        type: "video",
        ext: "mp4",
        url: sdMatch[1],
      });
    }

    if (formats.length > 0) {
      return {
        platform: "facebook",
        title: "Facebook Video",
        author: "Facebook Page / User",
        thumbnail: "",
        duration: 0,
        formats,
        photos: [],
        hasPdfOption: false,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] SnapSave Facebook error:", err);
  }

  throw new Error("Facebook video could not be extracted.");
}
