// src-scrapers/platforms/youtube.js

export async function scrapeYouTube(url, fetchClient) {
  // Extract Video ID
  const idMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i);
  const videoId = idMatch ? idMatch[1] : null;

  // Server 1: Cobalt / Y2Mate API
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://api.cobalt.tools/api/json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: { url, vQuality: "1080", isAudioOnly: false },
    }, "Cobalt");

    if (res?.url) {
      return {
        platform: "youtube",
        title: res.filename || "YouTube Video",
        author: "YouTube Creator",
        thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "",
        duration: 0,
        formats: [
          {
            id: "yt_1080p",
            label: "Video (1080p Full HD)",
            quality: "1080p",
            type: "video",
            ext: "mp4",
            url: res.url,
          },
          {
            id: "yt_mp3",
            label: "Audio Only (MP3)",
            quality: "192kbps",
            type: "audio",
            ext: "mp3",
            url: `https://api.cobalt.tools/api/json?audio=true&url=${encodeURIComponent(url)}`,
          }
        ],
        photos: [],
        hasPdfOption: false,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] Cobalt failed, trying YtMp3 fallback:", err);
  }

  // Fallback: Direct Video ID metadata extraction
  if (videoId) {
    return {
      platform: "youtube",
      title: `YouTube Video (${videoId})`,
      author: "YouTube Creator",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: 0,
      formats: [
        {
          id: "yt_auto",
          label: "Video Stream (Auto Quality)",
          quality: "Best Available",
          type: "video",
          ext: "mp4",
          url: `https://invidious.jing.rocks/latest_version?id=${videoId}&itag=22`,
        },
        {
          id: "yt_audio",
          label: "Audio Stream (M4A/MP3)",
          quality: "Audio 128kbps",
          type: "audio",
          ext: "m4a",
          url: `https://invidious.jing.rocks/latest_version?id=${videoId}&itag=140`,
        }
      ],
      photos: [],
      hasPdfOption: false,
    };
  }

  throw new Error("YouTube video could not be resolved.");
}
