// src-scrapers/platforms/threads.js

export async function scrapeThreads(url, fetchClient) {
  // Threads scraper via FastDl Threads API
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://threadsphotodownloader.com/api/threads",
      headers: {
        "Content-Type": "application/json",
      },
      data: { url },
    }, "ThreadsDownloader");

    if (res?.media) {
      const formats = [];
      const photos = [];

      res.media.forEach((item, idx) => {
        if (item.type === "video") {
          formats.push({
            id: `threads_video_${idx + 1}`,
            label: `Threads Video ${idx + 1}`,
            quality: "HD",
            type: "video",
            ext: "mp4",
            url: item.url,
          });
        } else {
          photos.push({
            id: `threads_photo_${idx + 1}`,
            label: `Photo ${idx + 1}`,
            url: item.url,
            ext: "jpg",
            type: "photo",
          });
        }
      });

      return {
        platform: "threads",
        title: res.caption || "Threads Post",
        author: res.user?.username || "Threads User",
        authorAvatar: res.user?.profile_pic || "",
        thumbnail: photos[0]?.url || "",
        duration: 0,
        formats,
        photos,
        hasPdfOption: photos.length > 1,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] Threads error:", err);
  }

  throw new Error("Threads media could not be extracted.");
}
