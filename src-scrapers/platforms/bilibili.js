// src-scrapers/platforms/bilibili.js

export async function scrapeBilibili(url, fetchClient) {
  const bvidMatch = url.match(/(BV[a-zA-Z0-9]+)/i);
  const bvid = bvidMatch ? bvidMatch[1] : null;

  if (bvid) {
    try {
      const res = await fetchClient({
        method: "GET",
        url: `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
        headers: { Referer: "https://www.bilibili.com/" },
      }, "Bilibili");

      if (res?.data) {
        const d = res.data;
        const cid = d.cid;

        return {
          platform: "bilibili",
          title: d.title || "Bilibili Video",
          author: d.owner?.name || "Bilibili Creator",
          thumbnail: d.pic || "",
          duration: d.duration || 0,
          formats: [
            {
              id: "bili_1080p",
              label: "Bilibili Video (High Definition)",
              quality: "HD",
              type: "video",
              ext: "mp4",
              url: `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&type=&otype=json`,
            }
          ],
          photos: [],
          hasPdfOption: false,
        };
      }
    } catch (err) {
      console.warn("[Skyc Scraper] Bilibili error:", err);
    }
  }

  throw new Error("Bilibili video could not be extracted.");
}
