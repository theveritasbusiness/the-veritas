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

export function getHeroImageUrl(url, focus = "auto") {
  return getCloudinaryImageUrl(url, focus);
}

export function getCardImageUrl(url, focus = "auto") {
  return getCloudinaryImageUrl(url, focus);
}

export function getStoryImageUrl(url) {
  return getCloudinaryImageUrl(url);
}
