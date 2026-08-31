import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import { createOriginal, fetchAdminOriginal, updateOriginal } from "../api";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { getYouTubeVideoId } from "../utils/youtube";

export default function OriginalEditor({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const videoId = getYouTubeVideoId(youtubeUrl);

  useEffect(() => {
    if (mode !== "edit" || !id) return undefined;

    let active = true;
    async function loadOriginal() {
      try {
        const original = await fetchAdminOriginal(id);
        if (!active) return;
        setTitle(original?.title || "");
        setDescription(original?.description || "");
        setYoutubeUrl(original?.youtube_url || original?.youtube_video_id || "");
        setError("");
      } catch (err) {
        if (active) setError(err.message || "Unable to load Original.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOriginal();
    return () => {
      active = false;
    };
  }, [id, mode]);

  async function saveOriginal() {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanUrl = youtubeUrl.trim();

    if (!cleanTitle || !cleanDescription || !cleanUrl) {
      setError("Title, description, and a YouTube link are required.");
      return;
    }

    if (!videoId) {
      setError("Enter a valid YouTube or youtu.be video link.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: cleanTitle,
        description: cleanDescription,
        youtube_url: cleanUrl,
        youtube_video_id: videoId
      };
      if (mode === "edit") {
        await updateOriginal(id, payload);
      } else {
        await createOriginal(payload);
      }
      navigate("/cms");
    } catch (err) {
      setError(err.message || "Unable to save Original.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black p-8 text-white">Loading Original...</div>;

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:p-10">
      <div className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-7">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--veritas-red)]">The Veritas Originals</div>
          <h1 className="mt-2 font-serif text-3xl">{mode === "edit" ? "Edit Original" : "Create New Original"}</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-400">Publish a Veritas-produced YouTube feature directly to the Originals page.</p>
        </div>

        {error ? <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div> : null}

        <label className="block space-y-2">
          <span className="text-sm text-neutral-200">Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded border border-neutral-700 bg-black p-3" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-neutral-200">Description</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} className="w-full rounded border border-neutral-700 bg-black p-3" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-neutral-200">YouTube video link</span>
          <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." className="w-full rounded border border-neutral-700 bg-black p-3" />
        </label>

        {youtubeUrl && !videoId ? <div className="text-sm text-red-400">Use a valid YouTube video URL.</div> : null}
        {videoId ? <YouTubeEmbed videoId={videoId} title={title || "Original preview"} /> : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={saveOriginal} disabled={submitting} className="rounded px-5 py-3 text-black disabled:opacity-60" style={{ backgroundColor: "var(--veritas-red)" }}>
            {submitting ? "Saving..." : mode === "edit" ? "Update Original" : "Publish Original"}
          </button>
          <button type="button" onClick={() => navigate("/cms")} className="rounded border border-neutral-700 px-5 py-3 text-white">Cancel</button>
        </div>
      </div>
    </div>
  );
}
