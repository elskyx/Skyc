// src-scrapers/platforms/bandcamp.js

export async function scrapeBandcamp(url, fetchClient) {
  try {
    const html = await fetchClient({
      method: "GET",
      url,
      headers: {
        Accept: "text/html",
      },
    }, "Bandcamp");

    const htmlStr = typeof html === "string" ? html : JSON.stringify(html);
    const tralbumMatch = htmlStr.match(/data-tralbum="([^"]+)"/i);

    if (tralbumMatch) {
      const tralbum = JSON.parse(tralbumMatch[1].replace(/&quot;/g, '"'));
      const track = tralbum.trackinfo?.[0];
      const audioUrl = track?.file?.["mp3-128"];

      return {
        platform: "bandcamp",
        title: track?.title || "Bandcamp Track",
        author: tralbum.artist || "Bandcamp Artist",
        thumbnail: tralbum.art_id ? `https://f4.bcbits.com/img/a${tralbum.art_id}_10.jpg` : "",
        duration: track?.duration || 0,
        formats: audioUrl ? [
          {
            id: "bandcamp_mp3",
            label: "Original Audio (MP3 128kbps)",
            quality: "128kbps",
            type: "audio",
            ext: "mp3",
            url: audioUrl,
          }
        ] : [],
        photos: [],
        hasPdfOption: false,
      };
    }
  } catch (err) {
    console.warn("[Skyc Scraper] Bandcamp error:", err);
  }

  throw new Error("Bandcamp media could not be extracted.");
}
