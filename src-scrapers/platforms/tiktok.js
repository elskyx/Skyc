// src-scrapers/platforms/tiktok.js

export async function scrapeTikTok(url, fetchClient) {
  // Server 1: TikWM API
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://www.tikwm.com/api/",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Referer: "https://www.tikwm.com/",
      },
      data: { url, count: 12, cursor: 0, web: 1, hd: 1 },
    }, "TikWM");

    if (res?.data) {
      const d = res.data;
      const formats = [];

      // HD Video No Watermark
      if (d.hdplay || d.play) {
        formats.push({
          id: "hd_nowm",
          label: "HD Video (No Watermark)",
          quality: "1080p / 720p",
          type: "video",
          ext: "mp4",
          url: d.hdplay ? (d.hdplay.startsWith("http") ? d.hdplay : `https://www.tikwm.com${d.hdplay}`) : d.play,
        });
      }

      // Audio MP3
      if (d.music) {
        formats.push({
          id: "audio_mp3",
          label: "Original Audio (MP3)",
          quality: "Audio 128kbps",
          type: "audio",
          ext: "mp3",
          url: d.music.startsWith("http") ? d.music : `https://www.tikwm.com${d.music}`,
        });
      }

      // Multi-Photo Carousel (Slide)
      let photos = [];
      if (d.images && Array.isArray(d.images) && d.images.length > 0) {
        photos = d.images.map((imgUrl, idx) => ({
          id: `photo_${idx + 1}`,
          label: `Photo ${idx + 1}`,
          url: imgUrl,
          ext: "jpg",
          type: "photo",
        }));
      }

      return {
        platform: "tiktok",
        title: d.title || "TikTok Media",
        author: d.author?.nickname || d.author?.unique_id || "TikTok User",
        authorAvatar: d.author?.avatar || "",
        thumbnail: d.cover || (photos[0]?.url) || "",
        duration: d.duration || 0,
        formats,
        photos,
        hasPdfOption: photos.length > 1,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] TikWM failed, trying fallback:", err);
  }

  // Fallback: Ssstik API
  const res2 = await fetchClient({
    method: "POST",
    url: "https://ssstik.io/abc?url=dl",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Referer: "https://ssstik.io/en",
    },
    data: { id: url, locale: "en", tt: "bXNj" },
  }, "Ssstik");

  const html = typeof res2 === "string" ? res2 : JSON.stringify(res2);
  const match = html.match(/href="(https:\/\/[^"]*tikcdn[^"]*)"/i);
  if (match) {
    return {
      platform: "tiktok",
      title: "TikTok Video",
      author: "TikTok User",
      thumbnail: "",
      duration: 0,
      formats: [
        {
          id: "nowm",
          label: "Video (No Watermark)",
          quality: "Standard HD",
          type: "video",
          ext: "mp4",
          url: match[1],
        }
      ],
      photos: [],
      hasPdfOption: false,
    };
  }

  throw new Error("TikTok media could not be extracted.");
}
