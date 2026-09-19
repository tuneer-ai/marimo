/* Copyright 2026 Marimo. All rights reserved. */

// Builds `src/embed-entry.ts` (which just re-exports `mount`/`unmount` from
// `./mount`) as a *separate*, independent Vite "library" build/module graph
// from the main `index.html` app entry.
//
// Why a whole separate build pass instead of a second `rolldownOptions.input`
// entry in the main config: when both `index.html` (which auto-invokes
// `mount()` via `main.tsx`'s own top-level code) and `src/embed-entry.ts`
// were built together as two entries of one build, Rolldown recognized that
// embed's entire module graph was a subset of main's and collapsed embed's
// output down to a one-line `import "./main-<hash>.js"` -- which both (a)
// dropped the `mount`/`unmount` exports embed is supposed to provide (they
// were tree-shaken away as "unused" since nothing in that shared build graph
// referenced them) and (b) executed `main.tsx`'s auto-mount side effects
// (which expect a `#root` element and `window.__MARIMO_MOUNT_CONFIG__`,
// neither of which exist when embedding into a host page). A fully separate
// build, with its own `build.lib` entry, keeps embed's exports intact.
import { createRequire } from "node:module";
import { defineConfig, mergeConfig } from "vite";
import base from "./vite.config.mts";

const require = createRequire(import.meta.url);

export default defineConfig(
  mergeConfig(base, {
    css: {
      // Scope all of the embed bundle's CSS under `.marimo-embed-root`
      // instead of using the project's normal postcss.config.cjs (which,
      // for this build, would otherwise apply Tailwind's global resets to
      // the whole host document). See postcss.config.embed.cjs for why.
      postcss: require("./postcss.config.embed.cjs"),
    },
    build: {
      // Written into the *same* dist/ dir as the main app build, without
      // wiping it -- this config must always run *after* the main build.
      outDir: "dist",
      emptyOutDir: false,
      // Non-dotfile path so it survives `cp -R dist/* _static/` in
      // scripts/buildfrontend.sh, and named distinctly from both the main
      // build's own `vite-manifest.json` and the pre-existing static
      // `manifest.json` (PWA web app manifest).
      manifest: "vite-manifest-embed.json",
      lib: {
        entry: "src/embed-entry.ts",
        formats: ["es"],
        fileName: () => "assets/embed.js",
      },
      rolldownOptions: {
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
  }),
);
