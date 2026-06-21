import React, { useMemo, useState } from "react";
import { useNavigate } from "../lib/router";
import { createSubcategory } from "../api";
import { CATEGORY_CONFIG } from "../content/categories";

export default function NewSubcategory() {
  const navigate = useNavigate();
  const categoryOptions = useMemo(() => CATEGORY_CONFIG.map((category) => category.name), []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoryOptions[0] || "World");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Subcategory name is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createSubcategory({
        name: name.trim(),
        category,
        description: description.trim()
      });

      navigate("/cms", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to create subcategory");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="mb-2 font-serif text-3xl">Create New Subcategory</h1>
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Subcategories appear as homepage editorial rails and can be attached to articles inside the CMS.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-neutral-300">Subcategory title</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
              placeholder="Example: Bihar Assembly Watch"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Parent category</label>
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
            <label className="mb-2 block text-sm text-neutral-300">Short description (optional)</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[110px] w-full rounded border border-neutral-700 bg-black px-3 py-2"
              placeholder="Used later if we want a dedicated subcategory landing experience."
            />
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
            {submitting ? "Creating..." : "Create New Subcategory"}
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
