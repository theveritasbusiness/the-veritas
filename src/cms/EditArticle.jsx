import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EditArticle() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [uploading, setUploading] = useState(false);
const [contentBlocks, setContentBlocks] = useState([]);
  useEffect(() => {
  fetch(`http://localhost:5000/articles`)
    .then(res => res.json())
    .then(data => {
      const found = data.find(a => a.id == id);

      setArticle(found);

      setContentBlocks(
        (found?.paragraphs || []).map(p => ({
          type: "paragraph",
          text: p
        }))
      );
    });
}, [id]);

  async function handleImageUpload(file) {
  if (!file) return;

  setUploading(true);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "veritas_uploads");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dft7kdsw6/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    setArticle(prev => ({
      ...prev,
      hero_image: data.secure_url
    }));

  } catch (err) {
    alert("Image upload failed");
  }

  setUploading(false);
}
async function updateArticle() {
  if (!article.hero_image) {
    alert("Image not uploaded yet");
    return;
  }

  console.log("SENDING IMAGE:", article.hero_image); // DEBUG

  const res = await fetch(`http://localhost:5000/articles/${id}`, {
    method: "PUT",
    headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("editorToken")}`
},
    body: JSON.stringify({
      title: article.title,
      subheadline: article.subheadline,
      category: article.category,
      hero_image: article.hero_image,
      hero_caption: article.hero_caption || "",
      hashtags: article.hashtags || [],
      content_blocks: contentBlocks,

paragraphs: contentBlocks
  .filter(b => b.type === "paragraph")
  .map(b => b.text),
      bibliography: article.bibliography,
      is_breaking: article.is_breaking || false,
      show_on_slider: article.show_on_slider ?? false
    })
  });

  if (res.ok) {
    alert("Updated successfully");
    window.location.href = "/cms";
  } else {
    const err = await res.json();
    alert("Update failed: " + err.error);
  }
}

  if (!article) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-3xl mx-auto bg-neutral-900 p-6 rounded space-y-4">

        <h2 className="text-2xl font-bold">Edit Article</h2>

        <input
          value={article.title}
          onChange={e => setArticle({ ...article, title: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <input
          value={article.subheadline || ""}
          onChange={e => setArticle({ ...article, subheadline: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <input
          value={article.category || ""}
          onChange={e => setArticle({ ...article, category: e.target.value })}
          className="w-full p-2 bg-black border"
        />

        <input
  type="file"
  accept="image/*"
  onChange={(e) => handleImageUpload(e.target.files[0])}
  className="w-full p-2 bg-black border"
/>

{uploading && (
  <div className="text-sm text-neutral-400">Uploading image...</div>
)}

{article.hero_image && (
  <img
    src={article.hero_image}
    className="w-full h-40 object-cover rounded mt-2"
  />
)}


        <textarea
          value={article.bibliography || ""}
          onChange={e => setArticle({ ...article, bibliography: e.target.value })}
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
    onClick={() =>
      setContentBlocks([...contentBlocks, { type: "paragraph", text: "" }])
    }
    className="bg-neutral-700 px-4 py-2 rounded"
  >
    + Paragraph
  </button>

  <button
    onClick={() =>
      setContentBlocks([...contentBlocks, { type: "subheading", text: "" }])
    }
    className="bg-neutral-700 px-4 py-2 rounded"
  >
    + Subheading
  </button>
</div>

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