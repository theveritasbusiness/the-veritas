const buildVariant = (() => {
  try {
    return import.meta.env?.VITE_VARIANT || 'full';
  } catch {
    return 'full';
  }
})();

export const SITE_VARIANT: string = (() => {
  if (typeof window === 'undefined') return buildVariant;

  const stored = localStorage.getItem('veritas-monitor-variant');
  if (stored === 'tech' || stored === 'full' || stored === 'finance' || stored === 'happy' || stored === 'commodity') {
    return stored;
  }

  return buildVariant;
})();
