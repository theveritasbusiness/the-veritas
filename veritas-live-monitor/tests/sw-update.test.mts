import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installSwUpdateHandler } from '../src/bootstrap/sw-update.ts';

// ---------------------------------------------------------------------------
// Fake environment
// ---------------------------------------------------------------------------

interface FakeElement {
  tagName: string;
  className: string;
  innerHTML: string;
  dataset: Record<string, string>;
  _listeners: Record<string, Array<(e: unknown) => void>>;
  _removed: boolean;
  classList: { _classes: Set<string>; add(c: string): void; remove(c: string): void; has(c: string): boolean };
  remove(): void;
  addEventListener(type: string, cb: (e: unknown) => void): void;
  closest(sel: string): { dataset: Record<string, string> } | null;
}

interface FakeEnv {
  doc: {
    visibilityState: string;
    setVisibilityState(v: string): void;
    _removedListeners: Array<() => void>;
    querySelector(sel: string): FakeElement | null;
    createElement(tag: string): FakeElement;
    body: {
      appendChild(el: FakeElement): void;
      contains(el: FakeElement | null): boolean;
    };
    addEventListener(type: string, cb: () => void): void;
    removeEventListener(type: string, cb: () => void): void;
  };
  swContainer: {
    _controller: object | null;
    readonly controller: object | null;
    addEventListener(type: string, cb: () => void): void;
    fireControllerChange(): void;
  };
  reload: () => void;
  reloadCalls: number[];
  appendedToasts: FakeElement[];
  visibilityListeners: Array<() => void>;
}

function makeEnv(): FakeEnv {
  const visibilityListeners: Array<() => void> = [];
  const appendedToasts: FakeElement[] = [];
  let _visibilityState = 'visible';

  const doc: FakeEnv['doc'] = {
    get visibilityState() { return _visibilityState; },
    setVisibilityState(v: string) { _visibilityState = v; },
    _removedListeners: [],

    querySelector(sel: string): FakeElement | null {
      if (sel === '.update-toast') return appendedToasts.at(-1) ?? null;
      return null;
    },

    createElement(_tag: string): FakeElement {
      const el: FakeElement = {
        tagName: _tag.toUpperCase(),
        className: '',
        innerHTML: '',
        dataset: {},
        _listeners: {},
        _removed: false,
        classList: {
          _classes: new Set<string>(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          has(c) { return this._classes.has(c); },
        },
        remove() { this._removed = true; },
        addEventListener(type: string, cb: (e: unknown) => void) {
          this._listeners[type] ??= [];
          this._listeners[type].push(cb);
        },
        closest(sel: string) {
          if (sel === '[data-action]') return null; // overridden per-click in clickToastButton
          return null;
        },
      };
      return el;
    },

    body: {
      appendChild(el: FakeElement) { appendedToasts.push(el); },
      contains(el: FakeElement | null): boolean {
        return el != null && !el._removed && appendedToasts.includes(el);
      },
    },

    addEventListener(type: string, cb: () => void) {
      if (type === 'visibilitychange') visibilityListeners.push(cb);
    },
    removeEventListener(type: string, cb: () => void) {
      if (type === 'visibilitychange') {
        const i = visibilityListeners.indexOf(cb);
        if (i !== -1) visibilityListeners.splice(i, 1);
        doc._removedListeners.push(cb);
      }
    },
  };

  const swListeners: Array<() => void> = [];
  const swContainer: FakeEnv['swContainer'] = {
    _controller: null,
    get controller() { return this._controller; },
    addEventListener(type: string, cb: () => void) {
      if (type === 'controllerchange') swListeners.push(cb);
    },
    fireControllerChange() {
      for (const cb of [...swListeners]) cb();
    },
  };

  const reloadCalls: number[] = [];
  const reload = () => reloadCalls.push(Date.now());

  return { doc, swContainer, reload, reloadCalls, appendedToasts, visibilityListeners };
}

function install(env: FakeEnv) {
  installSwUpdateHandler({
    swContainer: env.swContainer,
    document: env.doc,
    reload: env.reload,
    raf: (cb) => cb(), // synchronous in tests — skips real rAF
  });
}

/** Simulate tab visibility change (e.g. going to background). */
function fireVisibility(env: FakeEnv) {
  for (const cb of [...env.visibilityListeners]) cb();
}

/** Simulate a button click inside the latest toast. */
function clickToastButton(env: FakeEnv, action: string) {
  const toast = env.appendedToasts.at(-1);
  assert.ok(toast, 'No toast found');
  const fakeTarget = {
    closest(sel: string) {
      if (sel === '[data-action]') return { dataset: { action } };
      return null;
    },
  };
  for (const cb of toast._listeners['click'] ?? []) {
    (cb as (e: { target: typeof fakeTarget }) => void)({ target: fakeTarget });
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('installSwUpdateHandler', () => {
  let env: FakeEnv;
  beforeEach(() => { env = makeEnv(); });

  // --- first-visit skip -------------------------------------------------------

  it('does not show a toast on the first controllerchange (no prior controller)', () => {
    env.swContainer._controller = null;
    install(env);
    env.swContainer.fireControllerChange();
    assert.equal(env.appendedToasts.length, 0);
  });

  it('shows a toast on controllerchange when a controller was already active', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();
    assert.equal(env.appendedToasts.length, 1);
  });

  // --- reload button ----------------------------------------------------------

  it('calls reload when the Reload button is clicked', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();
    clickToastButton(env, 'reload');
    assert.equal(env.reloadCalls.length, 1);
  });

  // --- dismiss button ---------------------------------------------------------

  it('does not call reload when dismiss is clicked', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();
    clickToastButton(env, 'dismiss');
    assert.equal(env.reloadCalls.length, 0);
  });

  it('removes the visibilitychange listener when dismiss is clicked', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();
    assert.ok(env.visibilityListeners.length > 0, 'expected a listener after toast shown');
    clickToastButton(env, 'dismiss');
    assert.equal(env.visibilityListeners.length, 0);
  });

  // --- hidden-tab auto-reload -------------------------------------------------

  it('calls reload when tab goes hidden with an active toast', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();
    env.doc.setVisibilityState('hidden');
    fireVisibility(env);
    assert.equal(env.reloadCalls.length, 1);
  });

  it('does NOT call reload when tab goes hidden after dismiss', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();
    clickToastButton(env, 'dismiss');
    env.doc.setVisibilityState('hidden');
    fireVisibility(env);
    assert.equal(env.reloadCalls.length, 0);
  });

  // --- PRIMARY: multi-deploy same-tab scenario --------------------------------

  it('shows a new toast for deploy N+1 after deploy N was dismissed', () => {
    env.swContainer._controller = {};
    install(env);

    // Deploy N
    env.swContainer.fireControllerChange();
    assert.equal(env.appendedToasts.length, 1, 'toast shown for deploy N');

    // User dismisses deploy N
    clickToastButton(env, 'dismiss');
    assert.equal(env.reloadCalls.length, 0, 'no reload on dismiss');

    // Deploy N+1
    env.swContainer.fireControllerChange();
    assert.equal(env.appendedToasts.length, 2, 'new toast shown for deploy N+1');
  });

  it('hidden-tab fallback fires for deploy N+1 after deploy N was dismissed', () => {
    env.swContainer._controller = {};
    install(env);

    // Deploy N — dismiss
    env.swContainer.fireControllerChange();
    clickToastButton(env, 'dismiss');
    assert.equal(env.reloadCalls.length, 0);

    // Deploy N+1 — do nothing, then hide tab
    env.swContainer.fireControllerChange();
    assert.equal(env.appendedToasts.length, 2, 'new toast shown for N+1');

    env.doc.setVisibilityState('hidden');
    fireVisibility(env);
    assert.equal(env.reloadCalls.length, 1, 'reload fires on hidden after N+1 toast');
  });

  it('hidden-tab fallback does NOT fire when both N and N+1 toasts were dismissed', () => {
    env.swContainer._controller = {};
    install(env);

    env.swContainer.fireControllerChange();
    clickToastButton(env, 'dismiss');

    env.swContainer.fireControllerChange();
    clickToastButton(env, 'dismiss');

    env.doc.setVisibilityState('hidden');
    fireVisibility(env);
    assert.equal(env.reloadCalls.length, 0, 'no reload — both toasts dismissed');
  });

  // --- visible-transition must NOT reload (P1 regression guard) ---------------

  it('does NOT reload when visibilitychange fires while state is still visible', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();
    // tab stays visible — fire visibilitychange anyway (e.g. focus events on some browsers)
    env.doc.setVisibilityState('visible');
    fireVisibility(env);
    assert.equal(env.reloadCalls.length, 0);
  });

  it('does NOT reload when tab goes hidden then returns to visible', () => {
    env.swContainer._controller = {};
    install(env);
    env.swContainer.fireControllerChange();

    // go hidden → should reload
    env.doc.setVisibilityState('hidden');
    fireVisibility(env);
    assert.equal(env.reloadCalls.length, 1);

    // just confirming the first hidden fired; now visible would not add a second reload
    env.doc.setVisibilityState('visible');
    fireVisibility(env);
    assert.equal(env.reloadCalls.length, 1, 'no second reload on visible transition');
  });

  // --- listener leak regression -----------------------------------------------

  it('removes the previous visibilitychange handler when a newer deploy replaces the toast', () => {
    env.swContainer._controller = {};
    install(env);

    // Deploy N — show toast, do NOT dismiss
    env.swContainer.fireControllerChange();
    assert.equal(env.visibilityListeners.length, 1, 'one listener after deploy N');

    // Deploy N+1 — replaces toast
    env.swContainer.fireControllerChange();
    assert.equal(env.visibilityListeners.length, 1, 'still exactly one listener after N+1');
    assert.ok(env.doc._removedListeners.length > 0, 'old listener was explicitly removed');
  });
});
