export const HERO_FOCUS_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "north", label: "Top" },
  { value: "north_west", label: "Top Left" },
  { value: "north_east", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "west", label: "Left" },
  { value: "east", label: "Right" },
  { value: "south", label: "Bottom" },
  { value: "south_west", label: "Bottom Left" },
  { value: "south_east", label: "Bottom Right" }
];

export function getCloudinaryImageUrl(url) {
  return url;
}

export function normalizeHeroCrop(crop = {}, focus = "auto") {
  const defaultsByFocus = {
    auto: { x: 50, y: 50, zoom: 1 },
    center: { x: 50, y: 50, zoom: 1 },
    north: { x: 50, y: 20, zoom: 1 },
    south: { x: 50, y: 80, zoom: 1 },
    east: { x: 80, y: 50, zoom: 1 },
    west: { x: 20, y: 50, zoom: 1 },
    north_west: { x: 20, y: 20, zoom: 1 },
    north_east: { x: 80, y: 20, zoom: 1 },
    south_west: { x: 20, y: 80, zoom: 1 },
    south_east: { x: 80, y: 80, zoom: 1 }
  };

  const base = defaultsByFocus[focus] || defaultsByFocus.auto;
  const x = Number.isFinite(Number(crop?.x)) ? Math.min(100, Math.max(0, Number(crop.x))) : base.x;
  const y = Number.isFinite(Number(crop?.y)) ? Math.min(100, Math.max(0, Number(crop.y))) : base.y;
  const zoom = Number.isFinite(Number(crop?.zoom))
    ? Math.min(2.2, Math.max(1, Number(crop.zoom)))
    : base.zoom;

  return { x, y, zoom };
}

export function getImageObjectPosition(focus = "auto") {
  const focusMap = {
    auto: "center center",
    center: "center center",
    north: "center top",
    south: "center bottom",
    east: "right center",
    west: "left center",
    north_west: "left top",
    north_east: "right top",
    south_west: "left bottom",
    south_east: "right bottom"
  };

  return focusMap[focus] || "center center";
}

export function getImagePresentation(focus = "auto", crop = null) {
  const normalizedCrop = normalizeHeroCrop(crop, focus);
  return {
    objectPosition: `${normalizedCrop.x}% ${normalizedCrop.y}%`,
    transform: `scale(${normalizedCrop.zoom})`
  };
}

export function getHeroImageUrl(url, focus = "auto") {
  return getCloudinaryImageUrl(url, focus);
}

export function getCardImageUrl(url, focus = "auto") {
  return getCloudinaryImageUrl(url, focus);
}

export function getStoryImageUrl(url) {
  return getCloudinaryImageUrl(url);
}
