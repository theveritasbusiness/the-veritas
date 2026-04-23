import React, { useState } from "react";
import { useNavigate } from "../lib/router";
import {
  API_BASE,
  CLOUDINARY_UPLOAD_PRESET,
  authHeaders,
  getCloudinaryUploadUrl
} from "../api";
import HeroImageEditor from "../components/HeroImageEditor";
import { HERO_FOCUS_OPTIONS } from "../utils/cloudinary";

export default function NewArticle() {
  const [title, setTitle] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [category, setCategory] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [heroCaption, setHeroCaption] = useState("");
  const [heroFocus, setHeroFocus] = useState("auto");
  const [heroCrop, setHeroCrop] = useState({ x: 50, y: 50, zoom: 1 });
  const [authorName, setAuthorName] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [bibliography, setBibliography] = useState("");
  const [breaking, setBreaking] = useState(false);
  const [showOnSlider, setShowOnSlider] = useState(false);
  const [isEditorial, setIsEditorial] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([{ type: "paragraph", text: "" }]);
  const navigate = useNavigate();

  function createTableBlock(columnCount = 3, rowCount = 2) {
    return {
      type: "table",
      title: "",
      headers: Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`),
      rows: Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, () => ""))
    };
  }

  function updateContentBlock(index, nextBlock) {
    setContentBlocks((prev) => prev.map((block, blockIndex) => (blockIndex === index ? nextBlock : block)));
  }

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

  async function uploadVideo(file) {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(getCloudinaryUploadUrl("video"), {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Video upload failed");
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

  async function handleInlineVideoUpload(file) {
    const videoUrl = await uploadVideo(file);
    if (videoUrl) {
      setContentBlocks((prev) => [
        ...prev,
        { type: "video", text: videoUrl, caption: "" }
      ]);
    }
  }

  async function submitArticle() {
    if (!title.trim()) {
      alert("Title required");
      return;
    }

    const nonEmptyBlocks = contentBlocks.filter((block) => {
        if (block.type === "image" || block.type === "video") {
          return block.text?.trim();
        }

        if (block.type === "table") {
          return (
            (block.title || "").trim() ||
            block.headers?.some((header) => header?.trim()) ||
            block.rows?.some((row) => row?.some((cell) => cell?.trim()))
          );
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

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

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
          hero_focus: heroFocus,
          hero_crop: heroCrop,
          author_name: authorName.trim(),
          hashtags: hashtags ? hashtags.split(",").map((item) => item.trim()).filter(Boolean) : [],
          content_blocks: nonEmptyBlocks,
          paragraphs: paragraphBlocks.map((block) => block.text),
          bibliography,
          is_breaking: breaking,
          show_on_slider: showOnSlider,
          is_editorial: isEditorial
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

        {heroImage && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">Default image focus</label>
              <select
                value={heroFocus}
                onChange={(e) => setHeroFocus(e.target.value)}
                className="w-full p-2 bg-black border"
              >
                {HERO_FOCUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <HeroImageEditor
              imageUrl={heroImage}
              value={heroCrop}
              onChange={setHeroCrop}
              focus={heroFocus}
            />
          </div>
        )}

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
            ) : block.type === "image" ? (
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
            ) : block.type === "video" ? (
              <div className="rounded border border-neutral-700 bg-black/60 p-3 space-y-3">
                {block.text && (
                  <video
                    src={block.text}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-72 rounded bg-black"
                  />
                )}
                <input
                  className="w-full p-2 bg-black border"
                  placeholder="Video caption (optional)..."
                  value={block.caption || ""}
                  onChange={(e) => {
                    const copy = [...contentBlocks];
                    copy[i].caption = e.target.value;
                    setContentBlocks(copy);
                  }}
                />
              </div>
            ) : (
              <div className="rounded border border-neutral-700 bg-black/60 p-3 space-y-4">
                <input
                  className="w-full p-2 bg-black border"
                  placeholder="Table title (optional)..."
                  value={block.title || ""}
                  onChange={(e) => {
                    const copy = [...contentBlocks];
                    copy[i] = { ...copy[i], title: e.target.value };
                    setContentBlocks(copy);
                  }}
                />

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        {(block.headers || []).map((header, headerIndex) => (
                          <th key={headerIndex} className="border border-white p-2 align-top">
                            <input
                              className="w-full bg-[var(--veritas-red)] text-white p-2 font-semibold"
                              value={header}
                              placeholder={`Header ${headerIndex + 1}`}
                              onChange={(e) => {
                                const headers = [...(block.headers || [])];
                                headers[headerIndex] = e.target.value;
                                updateContentBlock(i, { ...block, headers });
                              }}
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {(block.rows || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-white p-2 align-top">
                              <input
                                className="w-full bg-black text-white p-2"
                                value={cell}
                                placeholder={`Row ${rowIndex + 1}, Col ${cellIndex + 1}`}
                                onChange={(e) => {
                                  const rows = (block.rows || []).map((currentRow) => [...currentRow]);
                                  rows[rowIndex][cellIndex] = e.target.value;
                                  updateContentBlock(i, { ...block, rows });
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    className="bg-neutral-700 px-3 py-2 rounded"
                    onClick={() => {
                      const nextHeaders = [...(block.headers || []), `Column ${(block.headers || []).length + 1}`];
                      const nextRows = (block.rows || []).map((row) => [...row, ""]);
                      updateContentBlock(i, { ...block, headers: nextHeaders, rows: nextRows });
                    }}
                  >
                    + Column
                  </button>

                  <button
                    type="button"
                    className="bg-neutral-700 px-3 py-2 rounded"
                    onClick={() => {
                      if ((block.headers || []).length <= 1) return;
                      const nextHeaders = [...(block.headers || [])];
                      nextHeaders.pop();
                      const nextRows = (block.rows || []).map((row) => row.slice(0, -1));
                      updateContentBlock(i, { ...block, headers: nextHeaders, rows: nextRows });
                    }}
                  >
                    Remove Column
                  </button>

                  <button
                    type="button"
                    className="bg-neutral-700 px-3 py-2 rounded"
                    onClick={() => {
                      const width = (block.headers || []).length || 1;
                      const nextRows = [...(block.rows || []), Array.from({ length: width }, () => "")];
                      updateContentBlock(i, { ...block, rows: nextRows });
                    }}
                  >
                    + Row
                  </button>

                  <button
                    type="button"
                    className="bg-neutral-700 px-3 py-2 rounded"
                    onClick={() => {
                      if ((block.rows || []).length <= 1) return;
                      const nextRows = [...(block.rows || [])];
                      nextRows.pop();
                      updateContentBlock(i, { ...block, rows: nextRows });
                    }}
                  >
                    Remove Row
                  </button>
                </div>
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

          <label className="bg-neutral-700 px-4 py-2 rounded cursor-pointer">
            + Video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleInlineVideoUpload(e.target.files?.[0])}
            />
          </label>

          <button
            type="button"
            onClick={() => setContentBlocks([...contentBlocks, createTableBlock()])}
            className="bg-neutral-700 px-4 py-2 rounded"
          >
            + Table
          </button>
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
        <label className="flex gap-2">
          <input type="checkbox" onChange={(e) => setIsEditorial(e.target.checked)} />
          Editorial
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
