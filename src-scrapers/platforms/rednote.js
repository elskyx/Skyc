// src-scrapers/platforms/rednote.js

export async function scrapeRedNote(url, fetchClient) {
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://dlpanda.com/id/rednote",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://dlpanda.com/",
      },
      data: { url },
    }, "DLPandaRedNote");

    const html = typeof res === "string" ? res : (res?.data || JSON.stringify(res));
    const formats = [];
    const photos = [];

    // Extract video
    const videoMatch = html.match(/href="([^"]*(?:sns-video|\.mp4)[^"]*)"/i);
    if (videoMatch) {
      formats.push({
        id: "rednote_video",
        label: "RedNote Video (No Watermark)",
        quality: "HD",
        type: "video",
        ext: "mp4",
        url: videoMatch[1],
      });
    }

    // Extract images
    const imgMatches = [...html.matchAll(/<img[^>]+src="([^">]+(?:sns-webpic|ci\.xiaohongshu\.com)[^">]*)"/gi)];
    for (const im of imgMatches) {
      photos.push({
        id: `rednote_p${photos.length + 1}`,
        label: `Photo ${photos.length + 1}`,
        url: im[1],
        ext: "jpg",
        type: "photo",
      });
    }

    if (formats.length > 0 || photos.length > 0) {
      return {
        platform: "rednote",
        title: "RedNote Note",
        author: "RedNote Creator",
        thumbnail: photos[0]?.url || "",
        duration: 0,
        formats,
        photos,
        hasPdfOption: photos.length > 1,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] RedNote error:", err);
  }

  throw new Error("RedNote post could not be extracted.");
}
