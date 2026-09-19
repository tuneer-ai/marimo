/* Copyright 2026 Marimo. All rights reserved. */

/**
 * When marimo is mounted into a host page (via `mount()` in `src/mount.tsx`),
 * `ThemeProvider` renders an extra wrapper element carrying the theme
 * classes instead of mutating `document.body` -- otherwise marimo's own
 * dark/light theme would leak onto the host page's own UI, since
 * `document.body` is shared with it.
 *
 * This is unset (and the original `document.body`-mutating behavior is used)
 * when marimo owns the whole page (its own server-rendered index.html),
 * which is still the common case outside of this embedding.
 */
let embedded = false;

export function setEmbedded(value: boolean): void {
  embedded = value;
}

export function isEmbedded(): boolean {
  return embedded;
}
