interface DocumentLike {
  readonly visibilityState: string;
  querySelector: (sel: string) => Element | null;
  createElement: (tag: string) => HTMLElement;
  body: { appendChild: (el: Element) => void; contains: (el: Element | null) => boolean };
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
}

interface ServiceWorkerContainerLike {
  readonly controller: object | null;
  addEventListener: (type: string, cb: () => void) => void;
}

export interface SwUpdateHandlerOptions {
  swContainer?: ServiceWorkerContainerLike;
  document?: DocumentLike;
  reload?: () => void;
  /** Override requestAnimationFrame for testing (defaults to global rAF). */
  raf?: (cb: () => void) => void;
}

/**
 * Wires up the SW update toast.
 *
 * On each controllerchange after the first (first = initial claim on a new session),
 * shows a dismissible "Update Available" toast. If the user dismisses the toast,
 * the tab auto-reloads the next time it goes to background. Dismissing one version
 * never suppresses toasts for future deploys.
 */
export function installSwUpdateHandler(options: SwUpdateHandlerOptions = {}): void {
  const swContainer = options.swContainer ?? navigator.serviceWorker;
  const doc = options.document ?? (document as unknown as DocumentLike);
  const reload = options.reload ?? (() => window.location.reload());
  const raf = options.raf ?? ((cb: () => void) => requestAnimationFrame(() => requestAnimationFrame(cb)));

  let currentOnHidden: (() => void) | null = null;

  const showToast = (): void => {
    if (currentOnHidden) {
      doc.removeEventListener('visibilitychange', currentOnHidden);
      currentOnHidden = null;
    }
    doc.querySelector('.update-toast')?.remove();

    const toast = doc.createElement('div');
    toast.className = 'update-toast';
    toast.innerHTML = `
      <div class="update-toast-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-.49-4.9L23 10"/>
        </svg>
      </div>
      <div class="update-toast-body">
        <div class="update-toast-title">Update Available</div>
        <div class="update-toast-detail">A new version is ready.</div>
      </div>
      <button class="update-toast-action" data-action="reload">Reload</button>
      <button class="update-toast-dismiss" data-action="dismiss" aria-label="Dismiss">\u00d7</button>
    `;

    let dismissed = false;

    const onHidden = (): void => {
      if (!dismissed && doc.visibilityState === 'hidden' && doc.body.contains(toast)) {
        reload();
      }
    };

    toast.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
      if (action === 'reload') {
        reload();
      } else if (action === 'dismiss') {
        dismissed = true;
        doc.removeEventListener('visibilitychange', onHidden);
        currentOnHidden = null;
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
      }
    });

    currentOnHidden = onHidden;
    doc.addEventListener('visibilitychange', onHidden);
    doc.body.appendChild(toast);
    raf(() => toast.classList.add('visible'));
  };

  let hadController = !!swContainer.controller;
  swContainer.addEventListener('controllerchange', () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    showToast();
  });
}
