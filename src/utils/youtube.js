// YouTube link handling for Originals and the article YouTube block.
// Everything here is pure string work: no YouTube API, no network calls.

// A YouTube video id is always 11 characters of [A-Za-z0-9_-].
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

// Accepts the normal formats an editor pastes from the address bar:
// youtube.com/watch?v=..., youtu.be/..., plus the embed/shorts/live paths.
// Returns "" when the input is not a YouTube link we recognise.
export function getYouTubeVideoId(input = "") {
  const value = String(input || "").trim();
  if (!value) return "";

  // A bare video id pasted on its own is accepted too.
  if (VIDEO_ID_PATTERN.test(value)) return value;

  let url;

  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return "";
  }

  const host = url.hostname.replace(/^(www|m|music)\./i, "").toLowerCase();
  const pathname = url.pathname || "";
  let videoId = "";

  if (host === "youtu.be") {
    videoId = pathname.split("/").filter(Boolean)[0] || "";
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const pathMatch = pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/i);
    videoId = pathMatch?.[1] || url.searchParams.get("v") || "";
  }

  return VIDEO_ID_PATTERN.test(videoId) ? videoId : "";
}

export function isValidYouTubeUrl(input = "") {
  return Boolean(getYouTubeVideoId(input));
}

export function getYouTubeEmbedUrl(input = "") {
  const videoId = getYouTubeVideoId(input);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
}

export function getYouTubeWatchUrl(input = "") {
  const videoId = getYouTubeVideoId(input);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
}

// Served straight off YouTube's thumbnail host, so no API key is involved.
export function getYouTubeThumbnailUrl(input = "", quality = "hqdefault") {
  const videoId = getYouTubeVideoId(input);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/${quality}.jpg` : "";
}
