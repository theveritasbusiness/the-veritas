import React, { useState } from "react";
import { useNavigate } from "../lib/router";
import {
  API_BASE,
  CLOUDINARY_UPLOAD_PRESET,
  authHeaders,
  getCloudinaryUploadUrl
} from "../api";

export default function NewArticle() {
  const [title, setTitle] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [category, setCategory] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [heroCaption, setHeroCaption] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [bibliography, setBibliography] = useState("");
  const [breaking, setBreaking] = useState(false);
  const [showOnSlider, setShowOnSlider] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([{ type: "paragraph", text: "" }]);
  const navigate = useNavigate();

  async function uploadImage(file) {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(getCloudinaryUploadUrl(), {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      return data.secure_url;
    } catch (err) {
      alert(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleImageUpload(file) {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setHeroImage(imageUrl);
    }
  }

  async function handleInlineImageUpload(file) {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setContentBlocks((prev) => [
        ...prev,
        { type: "image", text: imageUrl, caption: "" }
      ]);
    }
  }

  async function submitArticle() {
    if (!title.trim()) {
      alert("Title required");
      return;
    }

    const nonEmptyBlocks = contentBlocks.filter((block) => {
      if (block.type === "image") {
        return block.text?.trim();
      }

      return block.text?.trim();
    });
    const paragraphBlocks = nonEmptyBlocks.filter((block) => block.type === "paragraph");

    if (paragraphBlocks.length === 0) {
      alert("At least one paragraph required");
      return;
    }

    if (!heroImage.trim()) {
      alert("Hero image URL required");
      return;
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();

    try {
      const res = await fetch(`${API_BASE}/articles`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          subheadline,
          slug,
          category,
          hero_image: heroImage,
          hero_caption: heroCaption,
          author_name: authorName.trim(),
          hashtags: hashtags ? hashtags.split(",").map((item) => item.trim()).filter(Boolean) : [],
          content_blocks: nonEmptyBlocks,
          paragraphs: paragraphBlocks.map((block) => block.text),
          bibliography,
          is_breaking: breaking,
          show_on_slider: showOnSlider
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Publish failed");
      }

      alert("Article published");
      navigate("/cms");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-3xl mx-auto bg-neutral-900 p-6 rounded space-y-4">
        <h2 className="text-2xl font-bold">Create Article</h2>

        <input placeholder="Headline" className="w-full p-2 bg-black border" onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Subheadline" className="w-full p-2 bg-black border" onChange={(e) => setSubheadline(e.target.value)} />
        <input placeholder="Category" className="w-full p-2 bg-black border" onChange={(e) => setCategory(e.target.value)} />
        <input type="file" accept="image/*" className="w-full p-2 bg-black border" onChange={(e) => handleImageUpload(e.target.files[0])} />

        {uploading && <div className="text-sm text-neutral-400">Uploading image...</div>}

        {heroImage && <img src={heroImage} className="w-full h-48 object-cover rounded mt-2" alt="Uploaded hero" />}

        <input placeholder="Hero Caption" className="w-full p-2 bg-black border" onChange={(e) => setHeroCaption(e.target.value)} />
        <input placeholder="Byline / Author Name" className="w-full p-2 bg-black border" onChange={(e) => setAuthorName(e.target.value)} />
        <input placeholder="Hashtags (comma separated)" className="w-full p-2 bg-black border" onChange={(e) => setHashtags(e.target.value)} />

        <h3 className="font-bold">Content</h3>

        {contentBlocks.map((block, i) => (
          <div key={i} className="space-y-2">
            {block.type === "paragraph" ? (
              <textarea
                className="w-full p-2 bg-black border"
                placeholder="Paragraph..."
                value={block.text}
                onChange={(e) => {
                  const copy = [...contentBlocks];
                  copy[i].text = e.target.value;
                  setContentBlocks(copy);
                }}
              />
            ) : block.type === "subheading" ? (
              <input
                className="w-full p-2 bg-black border text-lg font-bold"
                placeholder="Subheading..."
                value={block.text}
                onChange={(e) => {
                  const copy = [...contentBlocks];
                  copy[i].text = e.target.value;
                  setContentBlocks(copy);
                }}
              />
            ) : (
              <div className="rounded border border-neutral-700 bg-black/60 p-3 space-y-3">
                {block.text && (
                  <img
                    src={block.text}
                    alt={block.caption || `Inline article image ${i + 1}`}
                    className="w-full max-h-72 object-cover rounded"
                  />
                )}
                <input
                  className="w-full p-2 bg-black border"
                  placeholder="Image caption (optional)..."
                  value={block.caption || ""}
                  onChange={(e) => {
                    const copy = [...contentBlocks];
                    copy[i].caption = e.target.value;
                    setContentBlocks(copy);
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setContentBlocks(contentBlocks.filter((_, blockIndex) => blockIndex !== i))}
              className="text-sm text-neutral-400 hover:text-white"
            >
              Remove block
            </button>
          </div>
        ))}

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setContentBlocks([...contentBlocks, { type: "paragraph", text: "" }])}
            className="bg-neutral-700 px-4 py-2 rounded"
          >
            + Paragraph
          </button>

          <button
            onClick={() => setContentBlocks([...contentBlocks, { type: "subheading", text: "" }])}
            className="bg-neutral-700 px-4 py-2 rounded"
          >
            + Subheading
          </button>

          <label className="bg-neutral-700 px-4 py-2 rounded cursor-pointer">
            + Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleInlineImageUpload(e.target.files?.[0])}
            />
          </label>
        </div>

        <textarea placeholder="Bibliography" className="w-full p-2 bg-black border" onChange={(e) => setBibliography(e.target.value)} />

        <label className="flex gap-2">
          <input type="checkbox" onChange={(e) => setBreaking(e.target.checked)} />
          Breaking News
        </label>
        <label className="flex gap-2">
          <input type="checkbox" onChange={(e) => setShowOnSlider(e.target.checked)} />
          Show on Homepage Slider
        </label>

        <button
          onClick={submitArticle}
          className="text-black py-2 rounded w-full"
          style={{ backgroundColor: "var(--veritas-red)" }}
        >
          Publish
        </button>
      </div>
    </div>
  );
}
