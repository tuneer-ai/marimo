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
 */
export { mount, unmount } from "@/mount";
