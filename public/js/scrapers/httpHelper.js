// public/js/scrapers/httpHelper.js
import { getUserAgent } from "../utils/index.js";

function safeGetLocalStorage(key) {
  try {
    if (typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
      return localStorage.getItem(key);
    }
  } catch (_) {}
  return null;
}

/**
 * Gets the configured HTTP timeout in milliseconds (defaults to 30s)
 */
export function getRequestTimeout() {
  const custom = parseInt(safeGetLocalStorage("skyc_request_timeout"), 10);
  if (!isNaN(custom) && custom >= 5 && custom <= 180) {
    return custom * 1000;
  }
  return 30000;
}

/**
 * Safely parses response data as JSON, throwing descriptive errors on Cloudflare/HTML challenge blocks
 */
export function parseJsonResponse(data, serverName = "Server") {
  if (typeof data === "object" && data !== null) return data;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed.startsWith("<") || trimmed.startsWith("<!DOCTYPE")) {
      throw new Error(`${serverName} returned an HTML error/challenge page. Please try another server or check connection.`);
    }
    try {
      return JSON.parse(trimmed);
    } catch (_) {
      throw new Error(`${serverName} returned an invalid response format.`);
    }
  }
  throw new Error(`${serverName} returned an empty response.`);
}

/**
 * Universal CORS-free HTTP client bridging Android OkHttp, Windows Tauri, and Web fetch
 */
export async function scraperFetch(options, serverName = "Scraper") {
  const method = (options.method || (options.data ? "POST" : "GET")).toUpperCase();
  const headers = { ...options.headers };

  if (!headers["User-Agent"] && !headers["user-agent"]) {
    headers["User-Agent"] = getUserAgent();
  }

  // Header spoofing
  if (safeGetLocalStorage("skyc_header_spoofing") !== "false") {
    try {
      const parsedUrl = new URL(options.url);
      if (!headers["Referer"]) headers["Referer"] = `${parsedUrl.protocol}//${parsedUrl.hostname}/`;
      if (!headers["Origin"]) headers["Origin"] = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    } catch (_) {}
    if (!headers["Accept"]) headers["Accept"] = "*/*";
    if (!headers["Accept-Language"]) headers["Accept-Language"] = "en-US,en;q=0.9,id;q=0.8";
  }

  let bodyData = options.data || null;
  if (typeof bodyData === "object" && bodyData !== null && !(bodyData instanceof FormData)) {
    if (headers["Content-Type"]?.includes("application/json")) {
      bodyData = JSON.stringify(bodyData);
    } else if (headers["Content-Type"]?.includes("application/x-www-form-urlencoded")) {
      bodyData = new URLSearchParams(bodyData).toString();
    }
  }

  // 1. Android Native OkHttp Bridge (Bypasses WebView CORS completely)
  if (typeof window !== "undefined" && window.SkycNativeHttp?.request) {
    try {
      const payload = JSON.stringify({
        url: options.url,
        method,
        headers,
        body: bodyData,
      });
      const rawRes = window.SkycNativeHttp.request(payload);
      const resObj = JSON.parse(rawRes);
      if (resObj.status >= 200 && resObj.status < 300) {
        if (options.rawText || options.responseType === "text" || options.expectHtml) {
          return resObj.body;
        }
        return parseJsonResponse(resObj.body, serverName);
      }
      throw new Error(`Native HTTP status ${resObj.status}: ${resObj.error || "Request failed"}`);
    } catch (e) {
      console.warn(`[Skyc Native Android] Request error:`, e);
      throw e;
    }
  }

  // 2. Windows Desktop Tauri v2 Reqwest Bridge (Bypasses CORS completely)
  if (typeof window !== "undefined" && window.__TAURI__?.core?.invoke) {
    try {
      const res = await window.__TAURI__.core.invoke("tauri_http_request", {
        url: options.url,
        method,
        headers,
        body: bodyData,
      });
      if (res.status >= 200 && res.status < 300) {
        if (options.rawText || options.responseType === "text" || options.expectHtml) {
          return res.data;
        }
        return parseJsonResponse(res.data, serverName);
      }
      throw new Error(`Tauri HTTP status ${res.status}`);
    } catch (e) {
      console.warn(`[Skyc Tauri Windows] Request error:`, e);
      throw e;
    }
  }

  // 3. Web Fetch Fallback (with AbortController timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getRequestTimeout());

  try {
    const fetchOptions = {
      method,
      headers,
      signal: controller.signal,
    };
    if (bodyData && method !== "GET") {
      fetchOptions.body = bodyData;
    }
    const resp = await fetch(options.url, fetchOptions);
    clearTimeout(timeoutId);

    if (options.rawText || options.responseType === "text" || options.expectHtml) {
      return await resp.text();
    }

    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await resp.json();
    }
    const text = await resp.text();
    return parseJsonResponse(text, serverName);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`${serverName} request timed out.`);
    }
    throw err;
  }
}
