/* Copyright 2026 Marimo. All rights reserved. */

/**
 * Standalone, non-auto-invoking entry point for embedding marimo into a
 * host application's own document (as opposed to `main.tsx`, which reads
 * `window.__MARIMO_MOUNT_CONFIG__` and calls `mount()` immediately on
 * import).
 *
 * A host page can dynamically `import()` this module and drive `mount()`
 * / `unmount()` itself, e.g. to switch between several open notebooks
 * inside a single shared container element without ever using an
 * `<iframe>`.
 *
 * `mount()`/`unmount()` themselves are shared with `main.tsx` (marimo's own
 * full-page bootstrap), so the "embedded" flag that scopes theme classes to
 * this bundle's own container instead of `document.body` (see
 * `src/theme/embed-target.ts` / `src/theme/ThemeProvider.tsx`) is set here,
 * not in `mount.tsx` itself -- only entries reached through *this* module
 * are actually embedded into a host page.
 */
import { mount as mountImpl, unmount as unmountImpl } from "@/mount";
import { setEmbedded } from "@/theme/embed-target";

export function mount(options: unknown, el: Element): Error | undefined {
  setEmbedded(true);
  return mountImpl(options, el);
}

export function unmount(): void {
  unmountImpl();
  setEmbedded(false);
}
