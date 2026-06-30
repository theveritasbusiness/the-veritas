import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "../lib/router";
import {
  API_BASE,
  CLOUDINARY_UPLOAD_PRESET,
  authHeaders,
  fetchAdminArticle,
  fetchSubcategories,
  getCloudinaryUploadUrl
} from "../api";
import HeroImageEditor from "../components/HeroImageEditor";
import { CATEGORY_CONFIG, isCategoryMatch } from "../content/categories";
import { HERO_FOCUS_OPTIONS, normalizeHeroCrop } from "../utils/cloudinary";

function normalizeEditorBlock(block) {
  if (typeof block === "string") {
    return { type: "paragraph", text: block };
  }

  if (!block || typeof block !== "object") {
    return { type: "paragraph", text: "" };
  }

  if (block.type === "image" || block.type === "video") {
    return {
      type: block.type,
      text: typeof block.text === "string" ? block.text : "",
      caption: typeof block.caption === "string" ? block.caption : ""
    };
  }

  if (block.type === "source") {
    return {
      type: "source",
      text: typeof block.text === "string" ? block.text : "",
      href: typeof block.href === "string" ? block.href : ""
    };
  }

  if (block.type === "table") {
    const headers = Array.isArray(block.headers) && block.headers.length > 0
      ? block.headers.map((header) => (typeof header === "string" ? header : ""))
      : ["Column 1", "Column 2", "Column 3"];

    const rows = Array.isArray(block.rows) && block.rows.length > 0
      ? block.rows.map((row) =>
        Array.isArray(row)
          ? headers.map((_, index) => (typeof row[index] === "string" ? row[index] : ""))
          : headers.map(() => "")
      )
      : [headers.map(() => ""), headers.map(() => "")];

    return {
      type: "table",
      title: typeof block.title === "string" ? block.title : "",
      headers,
      rows
    };
  }

  if (block.type === "subheading") {
    return {
      type: "subheading",
      text: typeof block.text === "string" ? block.text : ""
    };
  }

  return {
    type: "paragraph",
    text: typeof block.text === "string" ? block.text : ""
  };
}

function normalizeEditorArticle(article) {
  return {
    ...article,
    title: typeof article?.title === "string" ? article.title : "",
    subheadline: typeof article?.subheadline === "string" ? article.subheadline : "",
    category: typeof article?.category === "string" ? article.category : "",
    subcategory: typeof article?.subcategory === "string" ? article.subcategory : "",
    subcategory_slug: typeof article?.subcategory_slug === "string" ? article.subcategory_slug : "",
    hero_image: typeof article?.hero_image === "string" ? article.hero_image : "",
    hero_caption: typeof article?.hero_caption === "string" ? article.hero_caption : "",
    hero_focus: typeof article?.hero_focus === "string" ? article.hero_focus : "auto",
    hero_crop: normalizeHeroCrop(article?.hero_crop, article?.hero_focus || "auto"),
    author_name: typeof article?.author_name === "string" ? article.author_name : "",
    hashtags: Array.isArray(article?.hashtags)
      ? article.hashtags.join(", ")
      : typeof article?.hashtags === "string"
        ? article.hashtags
        : "",
    bibliography: typeof article?.bibliography === "string" ? article.bibliography : "",
    is_breaking: Boolean(article?.is_breaking),
    show_on_slider: Boolean(article?.show_on_slider),
    is_editorial: Boolean(article?.is_editorial)
  };
}

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [error, setError] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  function createTableBlock(columnCount = 3, rowCount = 2) {
    return {
      type: "table",
      title: "",
      headers: Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`),
      rows: Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, () => ""))
    };
  }

  function createSourceBlock() {
    return {
      type: "source",
      text: "",
      href: ""
    };
  }

  function updateContentBlock(index, nextBlock) {
    setContentBlocks((prev) => prev.map((block, blockIndex) => (blockIndex === index ? nextBlock : block)));
  }

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    async function loadArticle() {
      try {
        const found = await fetchAdminArticle(id);
        setArticle(normalizeEditorArticle(found));
        setContentBlocks(
          Array.isArray(found?.content_blocks) && found.content_blocks.length > 0
            ? found.content_blocks.map(normalizeEditorBlock)
            : [{ type: "paragraph", text: "" }]
        );
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }

    loadArticle();
    return undefined;
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadSubcategories() {
      try {
        const data = await fetchSubcategories();
        if (isMounted) {
          setSubcategories(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setSubcategories([]);
        }
      }
    }

    loadSubcategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const availableSubcategories = useMemo(() => {
    if (!article?.category) return subcategories;
    return subcategories.filter(
      (subcategory) => isCategoryMatch(subcategory.category, article.category)
    );
  }, [article?.category, subcategories]);

  useEffect(() => {
    if (!article?.subcategory_slug) return;
    if (!availableSubcategories.some((subcategory) => subcategory.slug === article.subcategory_slug)) {
      setArticle((currentArticle) =>
        currentArticle
          ? {
            ...currentArticle,
            subcategory: "",
            subcategory_slug: ""
          }
          : currentArticle
      );
    }
  }, [availableSubcategories, article?.subcategory_slug]);

  async function uploadAsset(file, resourceType = "image") {
    if (!file) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(getCloudinaryUploadUrl(resourceType), {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message || `${resourceType} upload failed`);
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
    const imageUrl = await uploadAsset(file, "image");
    if (imageUrl) {
      setArticle((prev) => ({
        ...prev,
        hero_image: imageUrl
      }));
    }
  }

  async function handleInlineImageUpload(file) {
    const imageUrl = await uploadAsset(file, "image");
    if (imageUrl) {
      setContentBlocks((prev) => [...prev, { type: "image", text: imageUrl, caption: "" }]);
    }
  }

  async function handleInlineVideoUpload(file) {
    const videoUrl = await uploadAsset(file, "video");
    if (videoUrl) {
      setContentBlocks((prev) => [...prev, { type: "video", text: videoUrl, caption: "" }]);
    }
  }

  async function updateArticle() {
    if (!article.hero_image) {
      alert("Image not uploaded yet");
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

    try {
      const res = await fetch(`${API_BASE}/articles/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          title: article.title,
          subheadline: article.subheadline,
          category: article.category,
          subcategory: article.subcategory || "",
          subcategory_slug: article.subcategory_slug || "",
          hero_image: article.hero_image,
          hero_caption: article.hero_caption || "",
          hero_focus: article.hero_focus || "auto",
          hero_crop: article.hero_crop || null,
          author_name: article.author_name || "",
          hashtags: article.hashtags
            ? article.hashtags.split(",").map((item) => item.trim()).filter(Boolean)
            : [],
          content_blocks: nonEmptyBlocks,
          paragraphs: paragraphBlocks.map((block) => block.text),
          bibliography: article.bibliography,
          is_breaking: article.is_breaking || false,
          show_on_slider: article.show_on_slider ?? false,
          is_editorial: article.is_editorial ?? false
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      alert("Updated successfully");
      navigate("/cms");
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) {
    return <div className="text-white p-6">{error}</div>;
  }

  if (!article) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-3xl mx-auto bg-neutral-900 p-6 rounded space-y-4">
        <h2 className="text-2xl font-bold">Edit Article</h2>

        <input
          value={article.title}
          onChange={(e) => setArticle({ ...article, title: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <input
          value={article.subheadline || ""}
          onChange={(e) => setArticle({ ...article, subheadline: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <select
          value={article.category || ""}
          onChange={(e) => setArticle({ ...article, category: e.target.value })}
          className="w-full p-2 bg-black border"
        >
          <option value="">Select category</option>
          {CATEGORY_CONFIG.map((categoryOption) => (
            <option key={categoryOption.slug} value={categoryOption.name}>
              {categoryOption.name}
            </option>
          ))}
        </select>

        <select
          value={article.subcategory_slug || ""}
          onChange={(e) => {
            const selected = availableSubcategories.find((subcategory) => subcategory.slug === e.target.value);
            setArticle({
              ...article,
              subcategory_slug: e.target.value,
              subcategory: selected?.name || ""
            });
          }}
          className="w-full p-2 bg-black border"
        >
          <option value="">No subcategory</option>
          {availableSubcategories.map((subcategory) => (
            <option key={subcategory.id || subcategory.slug} value={subcategory.slug}>
              {subcategory.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files?.[0])}
          className="w-full p-2 bg-black border"
        />

        {uploading && <div className="text-sm text-neutral-400">Uploading asset...</div>}

        {article.hero_image && (
          <div className="space-y-4">
            <img
              src={article.hero_image}
              className="w-full h-40 object-cover rounded mt-2"
              alt="Current hero"
            />
            <div>
              <label className="mb-2 block text-sm text-neutral-300">Default image focus</label>
              <select
                value={article.hero_focus || "auto"}
                onChange={(e) => setArticle({ ...article, hero_focus: e.target.value })}
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
              imageUrl={article.hero_image}
              value={article.hero_crop || normalizeHeroCrop({}, article.hero_focus || "auto")}
              onChange={(nextCrop) => setArticle({ ...article, hero_crop: nextCrop })}
              focus={article.hero_focus || "auto"}
            />
          </div>
        )}

        <input
          value={article.hero_caption || ""}
          onChange={(e) => setArticle({ ...article, hero_caption: e.target.value })}
          className="w-full p-2 bg-black border"
          placeholder="Hero caption"
        />

        <input
          value={article.author_name || ""}
          onChange={(e) => setArticle({ ...article, author_name: e.target.value })}
          className="w-full p-2 bg-black border"
          placeholder="Byline / Author Name"
        />

        <input
          value={article.hashtags || ""}
          onChange={(e) => setArticle({ ...article, hashtags: e.target.value })}
          className="w-full p-2 bg-black border"
          placeholder="Hashtags (comma separated)"
        />

        <textarea
          value={article.bibliography || ""}
          onChange={(e) => setArticle({ ...article, bibliography: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <h3 className="font-bold mt-4">Content</h3>

        {contentBlocks.map((block, i) => (
          <div key={i} className="space-y-2">
            {block.type === "paragraph" ? (
              <textarea
                className="w-full p-2 bg-black border mb-2"
                value={block.text}
                onChange={(e) => {
                  const copy = [...contentBlocks];
                  copy[i].text = e.target.value;
                  setContentBlocks(copy);
                }}
              />
            ) : block.type === "subheading" ? (
              <input
                className="w-full p-2 bg-black border text-lg font-bold mb-2"
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
                  value={block.caption || ""}
                  placeholder="Image caption (optional)"
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
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-72 rounded bg-black"
                  >
                    <source src={block.text} />
                    Your browser does not support embedded video playback.
                  </video>
                )}
                <input
                  className="w-full p-2 bg-black border"
                  value={block.caption || ""}
                  placeholder="Video caption (optional)"
                  onChange={(e) => {
                    const copy = [...contentBlocks];
                    copy[i].caption = e.target.value;
                    setContentBlocks(copy);
                  }}
                />
              </div>
            ) : block.type === "source" ? (
              <div className="rounded border border-white/15 bg-neutral-950 p-4 space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-[var(--veritas-red)]">Source</div>
                <input
                  className="w-full p-2 bg-black border"
                  value={block.text || ""}
                  placeholder="Source text"
                  onChange={(e) => {
                    const copy = [...contentBlocks];
                    copy[i].text = e.target.value;
                    setContentBlocks(copy);
                  }}
                />
                <input
                  className="w-full p-2 bg-black border"
                  value={block.href || ""}
                  placeholder="Source URL"
                  onChange={(e) => {
                    const copy = [...contentBlocks];
                    copy[i].href = e.target.value;
                    setContentBlocks(copy);
                  }}
                />
              </div>
            ) : (
              <div className="rounded border border-neutral-700 bg-black/60 p-3 space-y-4">
                <input
                  className="w-full p-2 bg-black border"
                  value={block.title || ""}
                  placeholder="Table title (optional)"
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

          <button
            type="button"
            onClick={() => setContentBlocks([...contentBlocks, createSourceBlock()])}
            className="bg-neutral-700 px-4 py-2 rounded"
          >
            + Source
          </button>
        </div>

        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={article.is_breaking || false}
            onChange={(e) => setArticle({ ...article, is_breaking: e.target.checked })}
          />
          Breaking News
        </label>

        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={article.show_on_slider ?? false}
            onChange={(e) => setArticle({ ...article, show_on_slider: e.target.checked })}
          />
          Show on Homepage Slider
        </label>

        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={article.is_editorial ?? false}
            onChange={(e) => setArticle({ ...article, is_editorial: e.target.checked })}
          />
          Editorial
        </label>

        <button onClick={updateArticle} className="bg-yellow-500 text-black py-2 rounded w-full">
          Update Article
        </button>
      </div>
    </div>
  );
}
