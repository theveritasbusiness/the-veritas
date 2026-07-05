import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import { fetchAdminShort, updateShort } from "../api";

function detectPlatform(url = "") {
  const value = String(url).toLowerCase();

  if (value.includes("instagram.com/reel/") || value.includes("instagram.com/p/")) {
    return "Instagram";
  }

  if (
    value.includes("youtube.com/shorts/") ||
    value.includes("youtu.be/") ||
    value.includes("youtube.com/watch")
  ) {
    return "YouTube";
  }

  return "Supported short";
}

export default function EditShort() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const detectedPlatform = useMemo(() => detectPlatform(url), [url]);

  useEffect(() => {
    if (!id) return undefined;

    async function loadShort() {
      try {
        const data = await fetchAdminShort(id);
        setUrl(data?.href || "");
        setError("");
      } catch (loadError) {
        setError(loadError.message || "Unable to load short");
      } finally {
        setLoading(false);
      }
    }

    loadShort();
    return undefined;
  }, [id]);

  async function handleSubmit() {
    if (!url.trim()) {
      setError("Short link is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await updateShort(id, {
        url: url.trim()
      });

      navigate("/cms", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to update short");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="mb-2 font-serif text-3xl">Edit Short</h1>
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Update the Instagram or YouTube short link shown in the homepage Latest Videos section.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-neutral-300">Short link</label>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={loading}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 disabled:opacity-60"
              placeholder="https://www.instagram.com/reel/... or https://www.youtube.com/shorts/..."
            />
          </div>

          <div className="rounded-xl border border-neutral-800 bg-black/70 px-4 py-3 text-sm text-neutral-300">
            Platform detected: <span className="font-semibold text-white">{detectedPlatform}</span>
          </div>
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
            {submitting ? "Saving..." : "Save Changes"}
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
