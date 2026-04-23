const CLOUDINARY_REGEX = /\/upload\/(?:v\d+\/)?(.+)$/i;

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

function isCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("/res.cloudinary.com/");
}

function injectTransformation(url, transformation) {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  return url.replace("/upload/", `/upload/${transformation}/`);
}

function buildTransformation(parts) {
  return parts.filter(Boolean).join(",");
}

export function getCloudinaryImageUrl(url, options = {}) {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    crop = "fill",
    gravity = "auto",
    quality = "auto:good",
    format = "auto",
    dpr = "auto"
  } = options;

  const transformation = buildTransformation([
    width ? `w_${width}` : "",
    height ? `h_${height}` : "",
    crop ? `c_${crop}` : "",
    gravity ? `g_${gravity}` : "",
    quality ? `q_${quality}` : "",
    format ? `f_${format}` : "",
    dpr ? `dpr_${dpr}` : ""
  ]);

  return injectTransformation(url, transformation);
}

export function getHeroImageUrl(url, focus = "auto") {
  return getCloudinaryImageUrl(url, {
    width: 1600,
    height: 900,
    crop: "fill",
    gravity: focus || "auto"
  });
}

export function getCardImageUrl(url, focus = "auto") {
  return getCloudinaryImageUrl(url, {
    width: 720,
    height: 720,
    crop: "fill",
    gravity: focus || "auto"
  });
}

export function getStoryImageUrl(url) {
  return getCloudinaryImageUrl(url, {
    width: 1400,
    crop: "limit",
    gravity: "auto"
  });
}

