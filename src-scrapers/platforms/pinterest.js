// src-scrapers/platforms/pinterest.js

export async function scrapePinterest(url, fetchClient) {
  // Server 1: PinDown API
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://pindown.app/api/action",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://pindown.app/",
      },
      data: { url },
    }, "PinDown");

    const html = typeof res === "string" ? res : (res?.data || JSON.stringify(res));
    const formats = [];
    const photos = [];

    // Check video
    const videoMatch = html.match(/href="([^"]*(?:v\.pinimg\.com|\.mp4)[^"]*)"/i);
    if (videoMatch) {
      formats.push({
        id: "pin_video",
        label: "Pinterest Video (MP4)",
        quality: "HD 720p",
        type: "video",
        ext: "mp4",
        url: videoMatch[1],
      });
    }

    // Check image
    const imgMatch = html.match(/href="([^"]*(?:i\.pinimg\.com\/originals|\.jpg)[^"]*)"/i);
    if (imgMatch) {
      photos.push({
        id: "pin_photo_1",
        label: "Original Resolution Image",
        url: imgMatch[1],
        ext: "jpg",
        type: "photo",
      });
    }

    if (formats.length > 0 || photos.length > 0) {
      return {
        platform: "pinterest",
        title: "Pinterest Pin",
        author: "Pinterest Creator",
        thumbnail: photos[0]?.url || "",
        duration: 0,
        formats,
        photos,
        hasPdfOption: false,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] PinDown error:", err);
  }

  throw new Error("Pinterest media could not be extracted.");
}
