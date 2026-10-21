// src-scrapers/platforms/pinterest.js

function extractPinId(url, html = "") {
  if (url) {
    const directMatch = url.match(/pin\/(\d+)/i);
    if (directMatch) return directMatch[1];
  }
  if (html) {
    const canonicalMatch = html.match(/<link [^>]*rel="canonical"[^>]*href="[^"]*pin\/(\d+)/i) ||
                           html.match(/<meta [^>]*property="og:url"[^>]*content="[^"]*pin\/(\d+)/i) ||
                           html.match(/pinterest\.com\/pin\/(\d+)/i) ||
                           html.match(/"pin_id":\s*"(\d+)"/i) ||
                           html.match(/"pins":\s*\{\s*"(\d+)"/i);
    if (canonicalMatch) return canonicalMatch[1];
  }
  return null;
}

function parsePinterestHtml(html, fallbackUrl = "") {
  let title = "Pinterest Pin";
  let author = "Pinterest Creator";
  let thumbnail = "";
  const formats = [];
  const photos = [];

  // 1. JSON-LD Strategy (Leaf snippet or generic ld+json)
  const ldMatches = [...html.matchAll(/<script [^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldMatches) {
    try {
      const ld = JSON.parse(m[1]);
      if (ld.headline && title === "Pinterest Pin") title = ld.headline.trim();
      if (ld.author?.name && author === "Pinterest Creator") author = ld.author.name.trim();

      if (ld.image) {
        const rawImgs = Array.isArray(ld.image) ? ld.image : [ld.image];
        for (const rawImg of rawImgs) {
          const imgUrl = typeof rawImg === "string" ? rawImg : (rawImg.url || rawImg.contentUrl);
          if (imgUrl && !photos.some((p) => p.url === imgUrl)) {
            const ext = imgUrl.toLowerCase().endsWith(".png") ? "png" : "jpg";
            photos.push({
              id: `pin_photo_${photos.length + 1}`,
              label: photos.length === 0 ? "Original Resolution Image" : `Original Image ${photos.length + 1}`,
              url: imgUrl,
              ext,
              type: "photo",
            });
          }
        }
      }

      if (ld.video) {
        const vidUrl = typeof ld.video === "string" ? ld.video : (ld.video.contentUrl || ld.video.embedUrl);
        if (vidUrl && !formats.some((f) => f.url === vidUrl)) {
          formats.push({
            id: `pin_video_${formats.length + 1}`,
            label: "Pinterest Video (MP4)",
            quality: "HD 720p",
            type: "video",
            ext: "mp4",
            url: vidUrl,
          });
        }
      }
    } catch (_) {}
  }

  // 2. Embedded State (__PWS_INITIAL_PROPS__ / __PWS_DATA__)
  const stateMatches = [
    html.match(/<script [^>]*id="__PWS_INITIAL_PROPS__"[^>]*>([\s\S]*?)<\/script>/i),
    html.match(/<script [^>]*id="__PWS_DATA__"[^>]*>([\s\S]*?)<\/script>/i),
  ];
  for (const sm of stateMatches) {
    if (!sm) continue;
    try {
      const data = JSON.parse(sm[1]);
      function findPins(obj, depth = 0) {
        if (!obj || depth > 8 || typeof obj !== "object") return;
        if (obj.images?.orig?.url || obj.videos?.video_list || obj.story_pin_data) {
          if (obj.title && title === "Pinterest Pin") title = obj.title.trim();
          if (obj.grid_title && title === "Pinterest Pin") title = obj.grid_title.trim();
          if (obj.pinner?.full_name && author === "Pinterest Creator") author = obj.pinner.full_name;
          else if (obj.pinner?.username && author === "Pinterest Creator") author = obj.pinner.username;

          // Original Resolution Image
          if (obj.images?.orig?.url) {
            const u = obj.images.orig.url;
            if (!photos.some((p) => p.url === u)) {
              photos.push({
                id: `pin_photo_${photos.length + 1}`,
                label: photos.length === 0 ? "Original Resolution Image" : `Original Image ${photos.length + 1}`,
                url: u,
                ext: u.toLowerCase().endsWith(".png") ? "png" : "jpg",
                type: "photo",
              });
            }
          }

          // HD Videos
          if (obj.videos?.video_list) {
            for (const [k, v] of Object.entries(obj.videos.video_list)) {
              if (v?.url && !formats.some((f) => f.url === v.url)) {
                formats.push({
                  id: `pin_video_${k}`,
                  label: `Pinterest Video (${k.replace(/^V_/, "")})`,
                  quality: k.replace(/^V_/, ""),
                  type: "video",
                  ext: "mp4",
                  url: v.url,
                });
              }
            }
          }

          // Story Pin / Carousel items
          if (obj.story_pin_data?.pages && Array.isArray(obj.story_pin_data.pages)) {
            for (const page of obj.story_pin_data.pages) {
              const pageImg = page.blocks?.[0]?.image?.images?.orig?.url;
              if (pageImg && !photos.some((p) => p.url === pageImg)) {
                photos.push({
                  id: `pin_photo_${photos.length + 1}`,
                  label: `Story Photo ${photos.length + 1}`,
                  url: pageImg,
                  ext: pageImg.toLowerCase().endsWith(".png") ? "png" : "jpg",
                  type: "photo",
                });
              }
            }
          }
        }
        for (const k of Object.keys(obj)) {
          findPins(obj[k], depth + 1);
        }
      }
      findPins(data);
    } catch (_) {}
  }

  // 3. Fallback Meta Tags
  if (title === "Pinterest Pin") {
    const ogTitle = html.match(/<meta [^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                    html.match(/<title>([^<]+)<\/title>/i);
    if (ogTitle) {
      title = ogTitle[1].replace(/\s*\|\s*Pinterest$/i, "").trim();
    }
  }

  const ogVideo = html.match(/<meta [^>]*property="og:video(?::secure_url)?"[^>]*content="([^"]+)"/i);
  if (ogVideo && !formats.some((f) => f.url === ogVideo[1])) {
    formats.push({
      id: "pin_video_og",
      label: "Pinterest Video (MP4)",
      quality: "HD 720p",
      type: "video",
      ext: "mp4",
      url: ogVideo[1],
    });
  }

  // 4. Fallback Regex for i.pinimg.com/originals/
  const origMatches = [...html.matchAll(/https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp)/gi)].map((m) => m[0]);
  for (const imgUrl of new Set(origMatches)) {
    if (imgUrl.includes("75x75") || imgUrl.includes("avatar")) continue;
    if (!photos.some((p) => p.url === imgUrl)) {
      photos.push({
        id: `pin_photo_${photos.length + 1}`,
        label: photos.length === 0 ? "Original Resolution Image" : `Original Image ${photos.length + 1}`,
        url: imgUrl,
        ext: imgUrl.toLowerCase().endsWith(".png") ? "png" : "jpg",
        type: "photo",
      });
    }
  }

  // 5. Fallback Regex for v.pinimg.com/videos/
  const vidMatches = [...html.matchAll(/https:\/\/v\.pinimg\.com\/videos\/[a-zA-Z0-9_\-\/]+\.mp4/gi)].map((m) => m[0]);
  for (const vidUrl of new Set(vidMatches)) {
    if (!formats.some((f) => f.url === vidUrl)) {
      formats.push({
        id: `pin_video_${formats.length + 1}`,
        label: "Pinterest Video (MP4)",
        quality: "HD",
        type: "video",
        ext: "mp4",
        url: vidUrl,
      });
    }
  }

  if (photos.length > 0) {
    thumbnail = photos[0].url;
  }

  return {
    platform: "pinterest",
    title,
    author,
    thumbnail,
    duration: 0,
    formats,
    photos,
    hasPdfOption: photos.length > 1,
  };
}

export async function scrapePinterest(url, fetchClient) {
  const targetUrl = (url || "").trim();
  if (!targetUrl) {
    throw new Error("Invalid or empty Pinterest URL.");
  }

  let pinId = extractPinId(targetUrl);
  let html = "";

  // Server 1: Direct HTML page scraping (handles pin.it shortlinks automatically via native client follow)
  try {
    const pageHtml = await fetchClient({
      method: "GET",
      url: targetUrl,
      rawText: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.pinterest.com/",
      },
    }, "Pinterest Direct");

    html = typeof pageHtml === "string" ? pageHtml : JSON.stringify(pageHtml);

    if (html && html.length > 200) {
      if (!pinId) {
        pinId = extractPinId(targetUrl, html);
      }
      const parsed = parsePinterestHtml(html, targetUrl);
      if (parsed && (parsed.formats.length > 0 || parsed.photos.length > 0)) {
        return parsed;
      }
    }
  } catch (directErr) {
    console.warn("[Skyc Scraper] Pinterest Direct HTML fetch error:", directErr);
  }

  // Server 2: Official Pinterest Widget API (Works reliably without CORS issues)
  if (pinId) {
    try {
      const widgetData = await fetchClient({
        method: "GET",
        url: `https://widgets.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
          Referer: "https://www.pinterest.com/",
        },
      }, "Pinterest Widget API");

      const pin = widgetData?.data?.[0];
      if (pin && pin.images) {
        const photos = [];
        const formats = [];
        const bestImg = pin.images["564x"] || pin.images["237x"] || pin.images["236x"];
        if (bestImg?.url) {
          const origUrl = bestImg.url.replace(/\/\d+x\//, "/originals/");
          photos.push({
            id: "pin_photo_1",
            label: "Original Resolution Image",
            url: origUrl,
            ext: origUrl.toLowerCase().endsWith(".png") ? "png" : "jpg",
            type: "photo",
          });
        }

        if (pin.videos?.video_list) {
          for (const [k, v] of Object.entries(pin.videos.video_list)) {
            if (v?.url && !formats.some((f) => f.url === v.url)) {
              formats.push({
                id: `pin_video_${k}`,
                label: `Pinterest Video (${k.replace(/^V_/, "")})`,
                quality: k.replace(/^V_/, ""),
                type: "video",
                ext: "mp4",
                url: v.url,
              });
            }
          }
        }

        if (photos.length > 0 || formats.length > 0) {
          return {
            platform: "pinterest",
            title: pin.description?.trim() || pin.link || "Pinterest Pin",
            author: pin.pinner?.full_name || pin.pinner?.username || "Pinterest Creator",
            thumbnail: photos[0]?.url || "",
            duration: 0,
            formats,
            photos,
            hasPdfOption: photos.length > 1,
          };
        }
      }
    } catch (widgetErr) {
      console.warn("[Skyc Scraper] Pinterest Widget API error:", widgetErr);
    }
  }

  // Server 3: Official Pinterest oEmbed API
  try {
    const oembedData = await fetchClient({
      method: "GET",
      url: `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(targetUrl)}`,
      headers: {
        Accept: "application/json",
        Referer: "https://www.pinterest.com/",
      },
    }, "Pinterest oEmbed API");

    if (oembedData?.thumbnail_url) {
      const orig = oembedData.thumbnail_url.replace(/\/\d+x\//, "/originals/");
      return {
        platform: "pinterest",
        title: oembedData.title?.trim() || "Pinterest Pin",
        author: oembedData.author_name || "Pinterest Creator",
        thumbnail: orig,
        duration: 0,
        formats: [],
        photos: [{
          id: "pin_photo_1",
          label: "Original Resolution Image",
          url: orig,
          ext: orig.toLowerCase().endsWith(".png") ? "png" : "jpg",
          type: "photo",
        }],
        hasPdfOption: false,
      };
    }
  } catch (oembedErr) {
    console.warn("[Skyc Scraper] Pinterest oEmbed API error:", oembedErr);
  }

  // Server 4: PinDown API fallback
  try {
    const res = await fetchClient({
      method: "POST",
      url: "https://pindown.app/api/action",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://pindown.app/",
      },
      data: { url: targetUrl },
    }, "PinDown");

    const htmlRes = typeof res === "string" ? res : (res?.data || JSON.stringify(res));
    const formats = [];
    const photos = [];

    const videoMatch = htmlRes.match(/href="([^"]*(?:v\.pinimg\.com|\.mp4)[^"]*)"/i);
    if (videoMatch) {
      formats.push({
        id: "pin_video",
        label: "Pinterest Video (MP4)",
        quality: "HD 720p",
        type: "video",
        ext: "mp4",
        url: videoMatch[1],
      });
    }

    const imgMatch = htmlRes.match(/href="([^"]*(?:i\.pinimg\.com\/originals|\.jpg)[^"]*)"/i);
    if (imgMatch) {
      photos.push({
        id: "pin_photo_1",
        label: "Original Resolution Image",
        url: imgMatch[1],
        ext: "jpg",
        type: "photo",
      });
    }

    if (formats.length > 0 || photos.length > 0) {
      return {
        platform: "pinterest",
        title: "Pinterest Pin",
        author: "Pinterest Creator",
        thumbnail: photos[0]?.url || "",
        duration: 0,
        formats,
        photos,
        hasPdfOption: photos.length > 1,
      };
    }
  } catch (pindownErr) {
    console.warn("[Skyc Scraper] PinDown fallback error:", pindownErr);
  }

  throw new Error("Pinterest media could not be extracted.");
}
