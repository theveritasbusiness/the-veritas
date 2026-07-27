import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import {
  createArticle,
  fetchAdminArticle,
  getCloudinaryUploadUrl,
  updateArticle,
  CLOUDINARY_UPLOAD_PRESET
} from "../api";
import { CATEGORY_CONFIG } from "../content/categories";

function createUpdate() {
  return {
    id: `live-update-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    heading: "",
    description: "",
    created_at: new Date().toISOString(),
    tweet_url: "",
    showTweetField: false,
    showDateTimeField: false
  };
}

function slugifyTitle(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeLiveUpdates(value) {
  if (!Array.isArray(value)) {
    return [createUpdate()];
  }

  const updates = value
    .filter(Boolean)
    .map((item, index) => ({
      id: item.id || `live-update-${index}-${Date.now()}`,
      heading: typeof item.heading === "string" ? item.heading : "",
      description: typeof item.description === "string" ? item.description : "",
      created_at: item.created_at || new Date().toISOString(),
      tweet_url: typeof item.tweet_url === "string" ? item.tweet_url : "",
      showTweetField: Boolean(item.tweet_url),
      showDateTimeField: false
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return updates.length > 0 ? updates : [createUpdate()];
}

export default function LiveArticleEditor({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const categoryOptions = useMemo(() => CATEGORY_CONFIG.map((category) => category.name), []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categoryOptions[0] || "World");
  const [authorName, setAuthorName] = useState("The Veritas Desk");
  const [heroImage, setHeroImage] = useState("");
  const [heroCaption, setHeroCaption] = useState("");
  const [showOnSlider, setShowOnSlider] = useState(false);
  const [showOnCategorySlider, setShowOnCategorySlider] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [updates, setUpdates] = useState([createUpdate()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return undefined;
    }

    async function loadArticle() {
      try {
        const article = await fetchAdminArticle(id);
        setTitle(article?.title || "");
        setDescription(article?.subheadline || "");
        setCategory(article?.category || categoryOptions[0] || "World");
        setAuthorName(article?.author_name || "The Veritas Desk");
        setHeroImage(article?.hero_image || "");
        setHeroCaption(article?.hero_caption || "");
        setShowOnSlider(Boolean(article?.show_on_slider));
        setShowOnCategorySlider(Boolean(article?.show_on_category_slider));
        setIsBreaking(Boolean(article?.is_breaking));
        setUpdates(normalizeLiveUpdates(article?.live_updates));
        setError("");
      } catch (loadError) {
        setError(loadError.message || "Unable to load live article");
      }
    }

    loadArticle();
    return undefined;
  }, [categoryOptions, id, mode]);

  async function uploadHeroImage(file) {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(getCloudinaryUploadUrl("image"), {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      setHeroImage(data.secure_url);
      setError("");
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addUpdate() {
    setUpdates((current) => [createUpdate(), ...current]);
  }

  function updateLiveUpdate(index, key, value) {
    setUpdates((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
            ...item,
            [key]: value
          }
          : item
      )
    );
  }

  function formatDateTimeInputValue(input) {
    const timestamp = input ? new Date(input) : null;
    if (!timestamp || Number.isNaN(timestamp.getTime())) {
      return "";
    }

    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Calcutta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    return formatter.format(timestamp).replace(" ", "T");
  }

  function parseDateTimeInputValue(value) {
    if (!value) return new Date().toISOString();
    const nextDate = new Date(`${value}:00+05:30`);
    return Number.isNaN(nextDate.getTime()) ? new Date().toISOString() : nextDate.toISOString();
  }

  function removeUpdate(index) {
    setUpdates((current) => {
      if (current.length === 1) {
        return [createUpdate()];
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Article title is required");
      return;
    }

    if (!description.trim()) {
      setError("Article description is required");
      return;
    }

    const cleanedUpdates = updates
      .map((item) => ({
        id: item.id,
        heading: item.heading.trim(),
        description: item.description.trim(),
        created_at: item.created_at || new Date().toISOString(),
        tweet_url: item.tweet_url?.trim() || ""
      }))
      .filter((item) => item.heading || item.description);

    if (cleanedUpdates.length === 0) {
      setError("Add at least one live update");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      title: title.trim(),
      subheadline: description.trim(),
      slug: slugifyTitle(title),
      category,
      author_name: authorName.trim() || "The Veritas Desk",
      hero_image: heroImage.trim(),
      hero_caption: heroCaption.trim(),
      hero_focus: "auto",
      hero_crop: null,
      hashtags: [],
      paragraphs: cleanedUpdates
        .map((item) => item.description)
        .filter(Boolean),
      bibliography: "",
      is_breaking: isBreaking,
      show_on_slider: showOnSlider,
      show_on_category_slider: showOnCategorySlider,
      is_editorial: false,
      is_live: true,
      live_updates: cleanedUpdates.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      content_blocks: []
    };

    try {
      if (mode === "edit" && id) {
        await updateArticle(id, payload);
      } else {
        await createArticle(payload);
      }

      navigate("/cms", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to save live article");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="mb-2 font-serif text-3xl">
          {mode === "edit" ? "Edit Live Article" : "Create Live Article"}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Build a live timeline story with rolling updates. Newer updates will appear on top on the public article page.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-neutral-300">Article Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
              placeholder="Example: Parliament March LIVE Updates"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-neutral-300">Article Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[110px] w-full rounded border border-neutral-700 bg-black px-3 py-2"
              placeholder="Short live summary shown on cards and article page."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Byline</label>
            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
              placeholder="The Veritas Desk"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-neutral-300">Thumbnail / Hero image (optional)</label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                value={heroImage}
                onChange={(event) => setHeroImage(event.target.value)}
                className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
                placeholder="https://..."
              />
              <label className="inline-flex cursor-pointer items-center justify-center rounded border border-neutral-700 px-4 py-2 text-sm text-white">
                {uploading ? "Uploading..." : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => uploadHeroImage(event.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-neutral-300">Image caption (optional)</label>
            <input
              value={heroCaption}
              onChange={(event) => setHeroCaption(event.target.value)}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-6 text-sm text-neutral-300">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isBreaking} onChange={(event) => setIsBreaking(event.target.checked)} />
            Breaking feed
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showOnSlider} onChange={(event) => setShowOnSlider(event.target.checked)} />
            Show on homepage slider
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnCategorySlider}
              onChange={(event) => setShowOnCategorySlider(event.target.checked)}
            />
            Show on category page slider
          </label>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">Live Updates</h2>
              <p className="mt-1 text-sm text-neutral-400">Each update gets its own timestamp and appears newest-first.</p>
            </div>

            <button
              type="button"
              onClick={addUpdate}
              className="rounded px-4 py-2 text-black"
              style={{ backgroundColor: "var(--veritas-red)" }}
            >
              New Update
            </button>
          </div>

          <div className="space-y-5">
            {updates.map((update, index) => (
              <div key={update.id} className="rounded-2xl border border-neutral-800 bg-black/70 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-[var(--veritas-red)]">
                    {new Date(update.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Calcutta"
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateLiveUpdate(index, "showTweetField", !update.showTweetField)}
                      className="rounded border border-neutral-700 px-3 py-1 text-xs text-neutral-300"
                    >
                      Add Tweet
                    </button>
                    <button
                      type="button"
                      onClick={() => updateLiveUpdate(index, "showDateTimeField", !update.showDateTimeField)}
                      className="rounded border border-neutral-700 px-3 py-1 text-xs text-neutral-300"
                    >
                      Customise date and time
                    </button>
                    <button
                      type="button"
                      onClick={() => updateLiveUpdate(index, "created_at", new Date().toISOString())}
                      className="rounded border border-neutral-700 px-3 py-1 text-xs text-neutral-300"
                    >
                      Refresh time
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUpdate(index)}
                      className="rounded border border-neutral-700 px-3 py-1 text-xs text-[var(--veritas-red)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-neutral-300">Update heading</label>
                    <input
                      value={update.heading}
                      onChange={(event) => updateLiveUpdate(index, "heading", event.target.value)}
                      className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-neutral-300">Update description</label>
                    <textarea
                      value={update.description}
                      onChange={(event) => updateLiveUpdate(index, "description", event.target.value)}
                      className="min-h-[120px] w-full rounded border border-neutral-700 bg-black px-3 py-2"
                    />
                  </div>

                  {update.showTweetField ? (
                    <div>
                      <label className="mb-2 block text-sm text-neutral-300">Tweet / X post URL</label>
                      <input
                        value={update.tweet_url || ""}
                        onChange={(event) => updateLiveUpdate(index, "tweet_url", event.target.value)}
                        className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
                        placeholder="https://x.com/... or https://twitter.com/..."
                      />
                    </div>
                  ) : null}

                  {update.showDateTimeField ? (
                    <div>
                      <label className="mb-2 block text-sm text-neutral-300">Custom date and time</label>
                      <input
                        type="datetime-local"
                        value={formatDateTimeInputValue(update.created_at)}
                        onChange={(event) =>
                          updateLiveUpdate(index, "created_at", parseDateTimeInputValue(event.target.value))
                        }
                        className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error ? <div className="mt-5 text-sm text-[var(--veritas-red)]">{error}</div> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="rounded px-4 py-2 text-black disabled:opacity-60"
            style={{ backgroundColor: "var(--veritas-red)" }}
          >
            {submitting ? "Saving..." : mode === "edit" ? "Update Live Article" : "Create Live Article"}
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
