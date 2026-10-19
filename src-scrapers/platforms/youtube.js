// src-scrapers/platforms/youtube.js

/**
 * Universal YouTube Media Scraper for Skyc
 * Replaces deprecated Cobalt v7 with multi-tiered resolution:
 * 1. Official YouTube OEmbed metadata extraction
 * 2. Async high-speed converter stream tokens (YtMp3 / Convert1s / Cobalt v10)
 * 3. Piped API progressive stream fallback
 */
export async function scrapeYouTube(url, fetchClient) {
  // 1. Extract Video ID
  const idMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
  );
  const videoId = idMatch ? idMatch[1] : null;

  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a standard YouTube video, shorts, or live link.");
  }

  let title = "YouTube Video";
  let author = "YouTube Creator";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let duration = 0;

  // 2. High-speed OEmbed Metadata Fetch (Public, zero-auth, zero-CORS)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedData = await fetchClient({
      method: "GET",
      url: oembedUrl,
      headers: {
        Accept: "application/json",
      },
    }, "YouTube OEmbed");

    if (oembedData && typeof oembedData === "object") {
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) author = oembedData.author_name;
      if (oembedData.thumbnail_url) thumbnail = oembedData.thumbnail_url;
    }
  } catch (oembedErr) {
    console.warn("[Skyc YouTube] OEmbed metadata lookup note:", oembedErr?.message || oembedErr);
  }

  // 3. User-configured Custom Cobalt v10 Instance (if configured in Settings)
  let customCobaltUrl = null;
  if (typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
    try {
      customCobaltUrl = localStorage.getItem("skyc_cobalt_instance");
    } catch (_) {}
  }

  if (customCobaltUrl && customCobaltUrl.startsWith("http")) {
    try {
      const cobaltEndpoint = customCobaltUrl.endsWith("/") ? customCobaltUrl : `${customCobaltUrl}/`;
      const cobaltRes = await fetchClient({
        method: "POST",
        url: cobaltEndpoint,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          videoQuality: "1080",
          downloadMode: "auto",
        },
      }, "Custom Cobalt");

      if (cobaltRes && (cobaltRes.url || cobaltRes.status === "tunnel" || cobaltRes.status === "redirect")) {
        const streamUrl = cobaltRes.url;
        return {
          platform: "youtube",
          title: cobaltRes.filename || title,
          author,
          thumbnail,
          duration,
          formats: [
            {
              id: "yt_1080p_cobalt",
              label: "Video (1080p Full HD)",
              quality: "1080p",
              type: "video",
              ext: "mp4",
              url: streamUrl,
            },
            {
              id: "yt_mp3_resolve",
              label: "Audio Only (MP3 320kbps)",
              quality: "320kbps",
              type: "audio",
              ext: "mp3",
              url: `youtube_resolve:mp3:${videoId}`,
            },
          ],
          photos: [],
          hasPdfOption: false,
        };
      }
    } catch (cobaltErr) {
      console.warn("[Skyc YouTube] Custom Cobalt instance failed, using default multi-tiered resolvers:", cobaltErr);
    }
  }

  // 4. Return Clean Verified Format List with Async Resolution Tokens
  // The actual media stream is resolved when the user selects the format and clicks Download Now.
  return {
    platform: "youtube",
    title,
    author,
    thumbnail,
    duration,
    formats: [
      {
        id: "yt_720p",
        label: "Video (720p HD MP4)",
        quality: "720p",
        type: "video",
        ext: "mp4",
        url: `youtube_resolve:mp4:${videoId}`,
      },
      {
        id: "yt_mp3",
        label: "Audio Only (MP3 320kbps)",
        quality: "320kbps",
        type: "audio",
        ext: "mp3",
        url: `youtube_resolve:mp3:${videoId}`,
      },
      {
        id: "yt_1080p",
        label: "Video (1080p Full HD)",
        quality: "1080p",
        type: "video",
        ext: "mp4",
        url: `youtube_resolve:1080p:${videoId}`,
      },
    ],
    photos: [],
    hasPdfOption: false,
  };
}
