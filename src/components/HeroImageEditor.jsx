import React, { useMemo, useRef, useState } from "react";
import { getCardImageUrl, getHeroImageUrl, normalizeHeroCrop } from "../utils/cloudinary";

function CropPreview({ src, crop, aspectClass, label }) {
  return (
    <div>
      <div className="mb-2 text-sm text-neutral-300">{label}</div>
      <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-black ${aspectClass}`}>
        <img
          src={src}
          alt={label}
          className="absolute inset-0 h-full w-full object-cover select-none"
          style={{
            objectPosition: `${crop.x}% ${crop.y}%`,
            transform: `scale(${crop.zoom})`
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

export default function HeroImageEditor({ imageUrl, value, onChange, focus = "auto" }) {
  const crop = useMemo(() => normalizeHeroCrop(value, focus), [value, focus]);
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function updateCrop(next) {
    onChange({
      x: Math.min(100, Math.max(0, next.x)),
      y: Math.min(100, Math.max(0, next.y)),
      zoom: Math.min(2.2, Math.max(1, next.zoom))
    });
  }

  function moveFromPointer(clientX, clientY) {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    updateCrop({ ...crop, x, y });
  }

  function handlePointerDown(event) {
    setDragging(true);
    moveFromPointer(event.clientX, event.clientY);
  }

  function handlePointerMove(event) {
    if (!dragging) return;
    moveFromPointer(event.clientX, event.clientY);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Manual image crop</div>
          <p className="mt-1 text-xs leading-5 text-neutral-400">
            Drag the image focus point and adjust zoom so the important subject stays visible.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-[var(--veritas-red)] hover:text-white"
          onClick={() => onChange(normalizeHeroCrop({}, focus))}
        >
          Reset
        </button>
      </div>

      <div
        ref={frameRef}
        className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          src={getHeroImageUrl(imageUrl, focus)}
          alt="Hero crop editor"
          className="absolute inset-0 h-full w-full object-cover select-none"
          style={{
            objectPosition: `${crop.x}% ${crop.y}%`,
            transform: `scale(${crop.zoom})`,
            cursor: dragging ? "grabbing" : "grab"
          }}
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 border border-white/15" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/60" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/60" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.18em] text-neutral-400">Horizontal</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={crop.x}
            onChange={(event) => updateCrop({ ...crop, x: Number(event.target.value) })}
            className="w-full accent-[var(--veritas-red)]"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.18em] text-neutral-400">Vertical</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={crop.y}
            onChange={(event) => updateCrop({ ...crop, y: Number(event.target.value) })}
            className="w-full accent-[var(--veritas-red)]"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.18em] text-neutral-400">Zoom</span>
          <input
            type="range"
            min="1"
            max="2.2"
            step="0.01"
            value={crop.zoom}
            onChange={(event) => updateCrop({ ...crop, zoom: Number(event.target.value) })}
            className="w-full accent-[var(--veritas-red)]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CropPreview
          src={getHeroImageUrl(imageUrl, focus)}
          crop={crop}
          aspectClass="aspect-[16/9]"
          label="Hero preview"
        />
        <CropPreview
          src={getCardImageUrl(imageUrl, focus)}
          crop={crop}
          aspectClass="aspect-square"
          label="Card preview"
        />
      </div>
    </div>
  );
}
