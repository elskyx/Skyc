// src-scrapers/platforms/applemusic.js

export async function scrapeAppleMusic(url, fetchClient) {
  // Apple Music via Aplmate resolver
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://aplmate.com/action/track",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://aplmate.com/",
      },
      data: { url },
    }, "Aplmate");

    const html = typeof res === "string" ? res : (res?.data || JSON.stringify(res));
    const titleMatch = html.match(/class="song-title"[^>]*>([^<]+)<\//i);
    const artistMatch = html.match(/class="artist-name"[^>]*>([^<]+)<\//i);
    const coverMatch = html.match(/<img[^>]+src="([^">]+apple[^">]*)"/i);

    return {
      platform: "applemusic",
      title: titleMatch ? titleMatch[1].trim() : "Apple Music Track",
      author: artistMatch ? artistMatch[1].trim() : "Apple Music Artist",
      thumbnail: coverMatch ? coverMatch[1] : "",
      duration: 0,
      formats: [
        {
          id: "apple_music_mp3",
          label: "Apple Music Track (MP3)",
          quality: "320kbps",
          type: "audio",
          ext: "mp3",
          url: `applemusic_resolve:${encodeURIComponent(url)}`,
        }
      ],
      photos: [],
      hasPdfOption: false,
    };
  } catch (err) {
    console.warn("[Skyc Scraper] Apple Music resolver error:", err);
  }

  throw new Error("Apple Music track could not be resolved.");
}
