import React, { useState } from "react";
export default function NewArticle() {
  const [title, setTitle] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [category, setCategory] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [heroCaption, setHeroCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [bibliography, setBibliography] = useState("");
  const [breaking, setBreaking] = useState(false);
  const [showOnSlider, setShowOnSlider] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([
  { type: "paragraph", text: "" }
]);
function updateBlock(i, value) {
  const copy = [...contentBlocks];
  copy[i].text = value;
  setContentBlocks(copy);
}

function addParagraphBlock() {
  setContentBlocks([...contentBlocks, { type: "paragraph", text: "" }]);
}

function addSubheadingBlock() {
  setContentBlocks([...contentBlocks, { type: "subheading", text: "" }]);
}

  async function handleImageUpload(file) {
  if (!file) return;

  setUploading(true);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "veritas_uploads"); // YOUR PRESET

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dft7kdsw6/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    setHeroImage(data.secure_url); // THIS is the real image URL
  } catch (err) {
    alert("Image upload failed");
  }

  setUploading(false);
}

  async function submitArticle() {

  // ✅ VALIDATION (CORRECT PLACE)
  if (!title.trim()) {
    alert("Title required");
    return;
  }

  if (contentBlocks.filter(b => b.text.trim()).length === 0)
     {
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

    const res = await fetch("http://localhost:5000/articles", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("editorToken")}`
},
      body: JSON.stringify({
  title,
  subheadline,
  slug,
  category,
  hero_image: heroImage,
  hero_caption: heroCaption,
  hashtags: hashtags
    ? hashtags.split(",").map(h => h.trim())
    : [],

  content_blocks: contentBlocks,

  paragraphs: contentBlocks
    .filter(b => b.type === "paragraph")
    .map(b => b.text),

  bibliography,
  is_breaking: breaking,
  show_on_slider: showOnSlider
})
});

    const data = await res.json();

    if (res.ok) {
      alert("Article published");
      window.location.href = "/";
    } else {
      alert("Publish failed: " + data.error);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-3xl mx-auto bg-neutral-900 p-6 rounded space-y-4">

        <h2 className="text-2xl font-bold">Create Article</h2>

        <input placeholder="Headline" className="w-full p-2 bg-black border" onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Subheadline" className="w-full p-2 bg-black border" onChange={e=>setSubheadline(e.target.value)} />
        <input placeholder="Category" className="w-full p-2 bg-black border" onChange={e=>setCategory(e.target.value)} />
        <input
  type="file"
  accept="image/*"
  className="w-full p-2 bg-black border"
  onChange={(e) => handleImageUpload(e.target.files[0])}
/>

{uploading && (
  <div className="text-sm text-neutral-400">Uploading image...</div>
)}

{heroImage && (
  <img
    src={heroImage}
    className="w-full h-48 object-cover rounded mt-2"
  />
)}
        <input placeholder="Hero Caption" className="w-full p-2 bg-black border" onChange={e=>setHeroCaption(e.target.value)} />
        <input placeholder="Hashtags (comma separated)" className="w-full p-2 bg-black border" onChange={e=>setHashtags(e.target.value)} />

        <h3 className="font-bold">Content</h3>

{contentBlocks.map((block, i) => (
  <div key={i}>
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
    ) : (
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

        <textarea placeholder="Bibliography" className="w-full p-2 bg-black border" onChange={e=>setBibliography(e.target.value)} />

        <label className="flex gap-2">
          <input type="checkbox" onChange={e=>setBreaking(e.target.checked)} />
          Breaking News
        </label>
        <label className="flex gap-2">
  <input
    type="checkbox"
    onChange={e => setShowOnSlider(e.target.checked)}
  />
  Show on Homepage Slider
</label>

        <button onClick={submitArticle} className="bg-red-600 text-black py-2 rounded w-full">
          Publish
        </button>

      </div>
    </div>
  );
}