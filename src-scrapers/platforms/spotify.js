// src-scrapers/platforms/spotify.js

export async function scrapeSpotify(url, fetchClient) {
  // Server 1: Spotidown / Spotifydown API
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://api.spotifydown.com/download",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://spotifydown.com/",
      },
      data: { link: url },
    }, "SpotifyDown");

    if (res?.success && res?.link) {
      return {
        platform: "spotify",
        title: res.metadata?.title || "Spotify Track",
        author: res.metadata?.artists || "Spotify Artist",
        thumbnail: res.metadata?.cover || "",
        duration: 0,
        formats: [
          {
            id: "spotify_mp3_320",
            label: "Audio MP3 (320kbps High Quality)",
            quality: "320kbps",
            type: "audio",
            ext: "mp3",
            url: res.link,
          }
        ],
        photos: [],
        hasPdfOption: false,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] SpotifyDown failed, trying fallback:", err);
  }

  // Fallback: Spotmate token resolution
  const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/i);
  if (trackIdMatch) {
    return {
      platform: "spotify",
      title: "Spotify Track",
      author: "Spotify Artist",
      thumbnail: "",
      duration: 0,
      formats: [
        {
          id: "spot_audio",
          label: "Spotify Audio (MP3)",
          quality: "320kbps",
          type: "audio",
          ext: "mp3",
          url: `spotidown_resolve:${trackIdMatch[1]}`,
        }
      ],
      photos: [],
      hasPdfOption: false,
    };
  }

  throw new Error("Spotify track could not be resolved.");
}
