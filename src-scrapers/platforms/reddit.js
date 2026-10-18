// src-scrapers/platforms/reddit.js

export async function scrapeReddit(url, fetchClient) {
  // Clean JSON endpoint
  try {
    const cleanUrl = url.split("?")[0].replace(/\/+$/, "") + ".json";
    const res = await fetchClient({
      method: "GET",
      url: cleanUrl,
      headers: {
        Accept: "application/json",
      },
    }, "RedditAPI");

    if (Array.isArray(res) && res[0]?.data?.children?.[0]?.data) {
      const post = res[0].data.children[0].data;
      const formats = [];
      const photos = [];

      // Check Reddit Video
      if (post.secure_media?.reddit_video?.fallback_url || post.media?.reddit_video?.fallback_url) {
        const vUrl = (post.secure_media || post.media).reddit_video.fallback_url;
        formats.push({
          id: "reddit_video",
          label: "Reddit Video (Audio & Video)",
          quality: `${(post.secure_media || post.media).reddit_video.height || "720"}p`,
          type: "video",
          ext: "mp4",
          url: vUrl,
        });
      }

      // Check Gallery
      if (post.gallery_data && post.media_metadata) {
        post.gallery_data.items.forEach((item, idx) => {
          const meta = post.media_metadata[item.media_id];
          if (meta?.s?.u) {
            photos.push({
              id: `reddit_p${idx + 1}`,
              label: `Photo ${idx + 1}`,
              url: meta.s.u.replace(/&amp;/g, "&"),
              ext: "jpg",
              type: "photo",
            });
          }
        });
      } else if (post.url && post.url.match(/\.(jpg|jpeg|png|webp)$/i)) {
        photos.push({
          id: "reddit_image",
          label: "Full Resolution Image",
          url: post.url,
          ext: "jpg",
          type: "photo",
        });
      }

      return {
        platform: "reddit",
        title: post.title || "Reddit Post",
        author: `u/${post.author || "reddit_user"} in r/${post.subreddit || "all"}`,
        thumbnail: post.thumbnail?.startsWith("http") ? post.thumbnail : (photos[0]?.url || ""),
        duration: 0,
        formats,
        photos,
        hasPdfOption: photos.length > 1,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] Reddit error:", err);
  }

  throw new Error("Reddit media could not be extracted.");
}
