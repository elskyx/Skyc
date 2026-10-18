// src-scrapers/platforms/twitter.js

export async function scrapeTwitter(url, fetchClient) {
  // Extract Tweet ID
  const tweetIdMatch = url.match(/(?:status|statuses)\/(\d+)/i);
  const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

  // Server 1: Twitsave / Fxtwitter API
  if (tweetId) {
    try {
      const res = await fetchClient({
        method: "GET",
        url: `https://api.fxtwitter.com/status/${tweetId}`,
        headers: { Accept: "application/json" },
      }, "FxTwitter");

      if (res?.tweet) {
        const t = res.tweet;
        const formats = [];
        const photos = [];

        if (t.media?.videos && t.media.videos.length > 0) {
          t.media.videos.forEach((v, idx) => {
            formats.push({
              id: `twitter_video_${idx + 1}`,
              label: `Video (HD)`,
              quality: "High Quality",
              type: "video",
              ext: "mp4",
              url: v.url,
            });
          });
        }

        if (t.media?.photos && t.media.photos.length > 0) {
          t.media.photos.forEach((p, idx) => {
            photos.push({
              id: `twitter_photo_${idx + 1}`,
              label: `Photo ${idx + 1}`,
              url: p.url,
              ext: "jpg",
              type: "photo",
            });
          });
        }

        return {
          platform: "twitter",
          title: t.text || "X / Twitter Post",
          author: `${t.author?.name || "Twitter User"} (@${t.author?.screen_name || ""})`,
          authorAvatar: t.author?.avatar_url || "",
          thumbnail: photos[0]?.url || "",
          duration: 0,
          formats,
          photos,
          hasPdfOption: photos.length > 1,
        };
      }
    } catch (err) {
      console.warn("[Skyc Scraper] FxTwitter failed, trying fallback:", err);
    }
  }

  // Fallback: Twitsave
  const res2 = await fetchClient({
    method: "GET",
    url: `https://twitsave.com/info?url=${encodeURIComponent(url)}`,
    headers: { Referer: "https://twitsave.com/" },
  }, "Twitsave");

  const html = typeof res2 === "string" ? res2 : JSON.stringify(res2);
  const match = html.match(/href="([^"]*(?:video\.twimg\.com|twitsave\.com\/download)[^"]*)"/i);
  if (match) {
    return {
      platform: "twitter",
      title: "X / Twitter Video",
      author: "Twitter User",
      thumbnail: "",
      duration: 0,
      formats: [
        {
          id: "tw_video",
          label: "Twitter Video (MP4)",
          quality: "HD",
          type: "video",
          ext: "mp4",
          url: match[1],
        }
      ],
      photos: [],
      hasPdfOption: false,
    };
  }

  throw new Error("X / Twitter media could not be extracted.");
}
