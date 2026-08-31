const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (YOUTUBE_VIDEO_ID.test(raw)) return raw;

  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    let videoId = "";

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || "";
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live", "v"].includes(parts[0])) {
          videoId = parts[1] || "";
        }
      }
    }

    return YOUTUBE_VIDEO_ID.test(videoId) ? videoId : "";
  } catch {
    return "";
  }
}

export function getYouTubeEmbedUrl(value = "") {
  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
}
