// src-scrapers/platforms/pixiv.js

export async function scrapePixiv(url, fetchClient) {
  const illustIdMatch = url.match(/artworks\/(\d+)/i) || url.match(/illust_id=(\d+)/i);
  const illustId = illustIdMatch ? illustIdMatch[1] : null;

  if (illustId) {
    try {
      const res = await fetchClient({
        method: "GET",
        url: `https://www.pixiv.net/ajax/illust/${illustId}`,
        headers: {
          Referer: "https://www.pixiv.net/",
          Accept: "application/json",
        },
      }, "Pixiv");

      if (res?.body) {
        const b = res.body;
        const photos = [];

        // Check single or manga pages
        if (b.pageCount > 1) {
          const pagesRes = await fetchClient({
            method: "GET",
            url: `https://www.pixiv.net/ajax/illust/${illustId}/pages`,
            headers: { Referer: "https://www.pixiv.net/" },
          }, "PixivPages");

          if (Array.isArray(pagesRes?.body)) {
            pagesRes.body.forEach((p, idx) => {
              photos.push({
                id: `pixiv_p${idx + 1}`,
                label: `Page ${idx + 1} (Original)`,
                url: p.urls?.original || p.urls?.regular,
                ext: "jpg",
                type: "photo",
              });
            });
          }
        } else {
          photos.push({
            id: "pixiv_original",
            label: "Original Full Resolution",
            url: b.urls?.original || b.urls?.regular,
            ext: "jpg",
            type: "photo",
          });
        }

        return {
          platform: "pixiv",
          title: b.title || "Pixiv Artwork",
          author: b.userName || "Pixiv Artist",
          authorAvatar: "",
          thumbnail: b.urls?.small || photos[0]?.url || "",
          duration: 0,
          formats: [],
          photos,
          hasPdfOption: photos.length > 1,
        };
      }
    } catch (err) {
      console.warn("[Skyc Scraper] Pixiv error:", err);
    }
  }

  throw new Error("Pixiv artwork could not be extracted.");
}
