import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "../lib/router";
import { createOriginal, fetchAdminOriginal, updateOriginal } from "../api";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { getYouTubeVideoId } from "../utils/youtube";

// Shared form behind both /cms/originals/new and /cms/originals/edit/:id.
// Originals carry only a title, a description and a YouTube link, so a single
// screen covers both modes.
export default function OriginalEditor({ mode = "create", originalId = null }) {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const videoId = useMemo(() => getYouTubeVideoId(youtubeUrl), [youtubeUrl]);
  const hasUrl = Boolean(youtubeUrl.trim());

  useEffect(() => {
    if (!isEditMode || !originalId) return undefined;

    let isMounted = true;

    async function loadOriginal() {
      try {
        const data = await fetchAdminOriginal(originalId);
        if (!isMounted) return;

        setTitle(data?.title || "");
        setDescription(data?.description || "");
        setYoutubeUrl(data?.youtube_url || "");
        setError("");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load Original");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOriginal();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, originalId]);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!videoId) {
      setError("Enter a valid YouTube link");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      title: title.trim(),
      description: description.trim(),
      youtube_url: youtubeUrl.trim()
    };

    try {
      if (isEditMode) {
        await updateOriginal(originalId, payload);
      } else {
        await createOriginal(payload);
      }

      navigate("/cms", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to save Original");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="mb-2 font-serif text-3xl">
          {isEditMode ? "Edit Original" : "Create New Original"}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Originals are video reports published on The Veritas Original page. Paste the YouTube
          link for the video — it is embedded directly from YouTube.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-neutral-300">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={loading}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 disabled:opacity-60"
              placeholder="Delhi's Drainage Crisis: Residents Speak Out"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={loading}
              rows={6}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 disabled:opacity-60"
              placeholder="What the report covers, and why it matters."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">YouTube video link</label>
            <input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              disabled={loading}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 disabled:opacity-60"
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            />

            {hasUrl && !videoId ? (
              <div className="mt-2 text-sm text-[var(--veritas-red)]">
                That does not look like a YouTube link. Use a youtube.com/watch?v=... or
                youtu.be/... URL.
              </div>
            ) : null}

            {videoId ? (
              <div className="mt-2 text-sm text-neutral-400">
                Video ID detected: <span className="font-semibold text-white">{videoId}</span>
              </div>
            ) : null}
          </div>

          {videoId ? (
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--veritas-red)]">
                Preview
              </div>
              <YouTubeEmbed url={youtubeUrl} title={title || "Original preview"} />
            </div>
          ) : null}
        </div>

        {error ? <div className="mt-4 text-sm text-[var(--veritas-red)]">{error}</div> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="rounded px-4 py-2 text-black disabled:opacity-60"
            style={{ backgroundColor: "var(--veritas-red)" }}
          >
            {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Publish Original"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/cms")}
            className="rounded border border-neutral-700 px-4 py-2 text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
