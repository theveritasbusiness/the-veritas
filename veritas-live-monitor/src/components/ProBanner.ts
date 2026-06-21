let bannerEl: HTMLElement | null = null;

export function showProBanner(container: HTMLElement): void {
  void container;
}

export function hideProBanner(): void {
  if (!bannerEl) return;
  bannerEl.classList.add('pro-banner-out');
  setTimeout(() => {
    bannerEl?.remove();
    bannerEl = null;
  }, 300);
}

export function isProBannerVisible(): boolean {
  return bannerEl !== null;
}
