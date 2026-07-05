import React, { useMemo, useState } from "react";
import { useNavigate } from "../lib/router";
import { createShort } from "../api";

function detectPlatform(url = "") {
  const value = String(url).toLowerCase();

  if (value.includes("instagram.com/reel/")) {
    return "Instagram Reel";
  }

  if (value.includes("youtube.com/shorts/") || value.includes("youtu.be/") || value.includes("youtube.com/watch")) {
    return "YouTube Short";
  }

  return "Supported short";
}

export default function NewShort() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const detectedPlatform = useMemo(() => detectPlatform(url), [url]);

  async function handleSubmit() {
    if (!url.trim()) {
      setError("Short link is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createShort({
        url: url.trim()
      });

      navigate("/cms", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to save short");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="mb-2 font-serif text-3xl">Add Short</h1>
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Paste an Instagram reel or YouTube short link. It will appear in the homepage Latest Videos section.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-neutral-300">Short link</label>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
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
            disabled={submitting}
            className="rounded px-4 py-2 text-black disabled:opacity-60"
            style={{ backgroundColor: "var(--veritas-red)" }}
          >
            {submitting ? "Saving..." : "Add Short"}
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
