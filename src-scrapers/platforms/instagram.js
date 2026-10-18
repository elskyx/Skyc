// src-scrapers/platforms/instagram.js

export async function scrapeInstagram(url, fetchClient) {
  // Server 1: SnapInsta API
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://snapinsta.app/action2.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://snapinsta.app/",
      },
      data: { url, action: "post" },
    }, "SnapInsta");

    const html = typeof res === "string" ? res : (res?.data || JSON.stringify(res));
    const formats = [];
    const photos = [];

    // Extract video links
    const videoMatches = [...html.matchAll(/href="([^"]*(?:snapinsta\.app\/get\.php|\.mp4)[^"]*)"/gi)];
    for (const vm of videoMatches) {
      formats.push({
        id: `video_${formats.length + 1}`,
        label: `Instagram Video ${formats.length + 1}`,
        quality: "HD 1080p",
        type: "video",
        ext: "mp4",
        url: vm[1],
      });
    }

    // Extract image links
    const imgMatches = [...html.matchAll(/<img[^>]+src="([^">]+\.(?:jpg|jpeg|webp|png)[^">]*)"/gi)];
    for (const im of imgMatches) {
      if (!im[1].includes("logo") && !im[1].includes("icon")) {
        photos.push({
          id: `photo_${photos.length + 1}`,
          label: `Photo ${photos.length + 1}`,
          url: im[1],
          ext: "jpg",
          type: "photo",
        });
      }
    }

    if (formats.length > 0 || photos.length > 0) {
      return {
        platform: "instagram",
        title: "Instagram Post",
        author: "Instagram Creator",
        thumbnail: photos[0]?.url || "",
        duration: 0,
        formats,
        photos,
        hasPdfOption: photos.length > 1,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] SnapInsta failed, trying fallback:", err);
  }

  // Server 2: FastDl fallback
  const res2 = await fetchClient({
    method: "POST",
    url: "https://fastdl.app/c/",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://fastdl.app/",
    },
    data: { url, lang_code: "en" },
  }, "FastDL");

  const html2 = typeof res2 === "string" ? res2 : JSON.stringify(res2);
  const match = html2.match(/href="([^"]*(?:download|fastdl\.app)[^"]*)"/i);
  if (match) {
    return {
      platform: "instagram",
      title: "Instagram Media",
      author: "Instagram Creator",
      thumbnail: "",
      duration: 0,
      formats: [
        {
          id: "ig_hd",
          label: "Instagram HD Media",
          quality: "High Definition",
          type: "video",
          ext: "mp4",
          url: match[1],
        }
      ],
      photos: [],
      hasPdfOption: false,
    };
  }

  throw new Error("Instagram media could not be extracted.");
}
