export function formatRelativeTime(input) {
  if (!input) return "Recently";

  const publishedAt = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(publishedAt.getTime())) return "Recently";

  const diffMs = Math.max(Date.now() - publishedAt.getTime(), 0);
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;
  const monthMs = 30 * dayMs;
  const yearMs = 365 * dayMs;

  if (diffMs < hourMs) {
    return "1hr";
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours}hr`;
  }

  if (diffMs < 30 * dayMs) {
    const days = Math.floor(diffMs / dayMs);
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  if (diffMs < yearMs) {
    const months = Math.floor(diffMs / monthMs);
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  const years = Math.floor(diffMs / yearMs);
  return `${years} year${years === 1 ? "" : "s"}`;
}

export function getArticleDisplayTime(article) {
  if (article?.published_at) {
    return formatRelativeTime(article.published_at);
  }

  if (article?.published_ago) {
    const hours = Number(article.published_ago.hours || 0);
    const minutes = Number(article.published_ago.minutes || 0);
    const totalMinutes = hours * 60 + minutes;
    return formatRelativeTime(Date.now() - totalMinutes * 60000);
  }

  return "Recently";
}
