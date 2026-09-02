import React from "react";
import { getYouTubeEmbedUrl } from "../utils/youtube";

// Single responsive YouTube player used by the Originals page, the article
// YouTube block, and the CMS previews. Renders nothing for an unusable link.
export default function YouTubeEmbed({ url, title = "YouTube video player", className = "" }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) return null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-lg ${className}`}
      style={{ aspectRatio: "16/9" }}
    >
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 h-full w-full"
        frameBorder="0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
