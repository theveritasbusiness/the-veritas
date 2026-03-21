import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_BASE,
  CLOUDINARY_UPLOAD_PRESET,
  authHeaders,
  fetchAdminArticle,
  getCloudinaryUploadUrl
} from "../api";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      try {
        const found = await fetchAdminArticle(id);
        setArticle(found);
        setContentBlocks(found.content_blocks || []);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }

    loadArticle();
  }, [id]);

  async function handleImageUpload(file) {
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

      setArticle((prev) => ({
        ...prev,
        hero_image: data.secure_url
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function updateArticle() {
    if (!article.hero_image) {
      alert("Image not uploaded yet");
      return;
    }

    const nonEmptyBlocks = contentBlocks.filter((block) => block.text.trim());
    const paragraphBlocks = nonEmptyBlocks.filter((block) => block.type === "paragraph");

    try {
      const res = await fetch(`${API_BASE}/articles/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          title: article.title,
          subheadline: article.subheadline,
          category: article.category,
          hero_image: article.hero_image,
          hero_caption: article.hero_caption || "",
          hashtags: article.hashtags || [],
          content_blocks: nonEmptyBlocks,
          paragraphs: paragraphBlocks.map((block) => block.text),
          bibliography: article.bibliography,
          is_breaking: article.is_breaking || false,
          show_on_slider: article.show_on_slider ?? false
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

        <input
          value={article.category || ""}
          onChange={(e) => setArticle({ ...article, category: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
          className="w-full p-2 bg-black border"
        />

        {uploading && <div className="text-sm text-neutral-400">Uploading image...</div>}

        {article.hero_image && (
          <img
            src={article.hero_image}
            className="w-full h-40 object-cover rounded mt-2"
            alt="Current hero"
          />
        )}

        <input
          value={article.hero_caption || ""}
          onChange={(e) => setArticle({ ...article, hero_caption: e.target.value })}
          className="w-full p-2 bg-black border"
          placeholder="Hero caption"
        />

        <textarea
          value={article.bibliography || ""}
          onChange={(e) => setArticle({ ...article, bibliography: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <h3 className="font-bold mt-4">Content</h3>

        {contentBlocks.map((block, i) => (
          <div key={i}>
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
            ) : (
              <input
                className="w-full p-2 bg-black border text-lg font-bold mb-2"
                value={block.text}
                onChange={(e) => {
                  const copy = [...contentBlocks];
                  copy[i].text = e.target.value;
                  setContentBlocks(copy);
                }}
              />
            )}
          </div>
        ))}

        <div className="flex gap-2">
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

        <button
          onClick={updateArticle}
          className="bg-yellow-500 text-black py-2 rounded w-full"
        >
          Update Article
        </button>
      </div>
    </div>
  );
}
