import { getYouTubeEmbedUrl } from "../utils/youtube";

export default function YouTubeEmbed({ videoId, url, title = "YouTube video", className = "" }) {
  const src = getYouTubeEmbedUrl(videoId || url);
  if (!src) return null;

  return (
    <div className={`overflow-hidden rounded-2xl bg-black shadow-lg ${className}`} style={{ aspectRatio: "16 / 9" }}>
      <iframe
        className="h-full w-full"
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
