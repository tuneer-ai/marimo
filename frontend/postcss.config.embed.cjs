/* Copyright 2026 Marimo. All rights reserved. */

/**
 * PostCSS config used *only* for the embeddable bundle (see
 * vite.config.embed.mts), which is mounted directly into a host page's own
 * DOM (see src/mount.tsx / src/embed-entry.ts) rather than owning the whole
 * page like marimo's normal index.html build.
 *
 * Without this, Tailwind's global reset/utility rules (bare `button`,
 * `html`, `body`, `:root` selectors, etc.) would cascade over the *entire*
 * host page, not just the marimo notebook the embed bundle renders --
 * visibly changing the host's own buttons/colors wherever selectors happen
 * to collide.
 *
 * Unlike marimo's own `VITE_MARIMO_ISLANDS` build (see postcss.config.cjs),
 * this does *not* use `postcss-prefix-selector` to textually rewrite every
 * selector: Tailwind v4's output leans heavily on `:where()`/`:is()` and
 * cascade layers (`@layer`), which a naive string-based selector rewrite
 * can silently mangle (observed directly: cell layout collapsed once every
 * selector was prefixed). Instead this uses the browser-native `@scope`
 * at-rule, which the CSS engine itself resolves against arbitrarily complex
 * selectors correctly, wrapping the whole stylesheet (after independently
 * rewriting the literal `:root`/`html`/`body`/`:host` selectors, which
 * `@scope` does not remap on its own -- they still refer to the real
 * document root/body regardless of the scope).
 */
const GLOBAL_SELECTORS = new Set([":root", ":host", "html", "body"]);
const EMBED_ROOT_CLASS = ".marimo-embed-root";

/** Rewrites bare :root/:host/html/body selectors to the embed root class. */
const scopeGlobalSelectorsPlugin = () => ({
  postcssPlugin: "marimo-embed-scope-globals",
  Once(root) {
    root.walkRules((rule) => {
      const selectors = rule.selectors;
      let changed = false;
      const next = selectors.map((selector) => {
        if (GLOBAL_SELECTORS.has(selector.trim())) {
          changed = true;
          return EMBED_ROOT_CLASS;
        }
        return selector;
      });
      if (changed) {
        rule.selectors = next;
      }
    });
  },
});
scopeGlobalSelectorsPlugin.postcss = true;

/**
 * Wraps every top-level node in `@scope (.marimo-embed-root) { ... }` so
 * none of the bundle's rules can match anything outside the mount
 * container, without having to understand each selector's own syntax.
 */
const wrapInScopePlugin = () => ({
  postcssPlugin: "marimo-embed-wrap-scope",
  OnceExit(root, { AtRule }) {
    const scope = new AtRule({
      name: "scope",
      params: `(${EMBED_ROOT_CLASS})`,
    });
    const children = root.nodes.slice();
    root.removeAll();
    scope.append(children);
    root.append(scope);
  },
});
wrapInScopePlugin.postcss = true;

const config = {
  plugins: [
    require("@tailwindcss/postcss"),
    scopeGlobalSelectorsPlugin(),
    process.env.NODE_ENV === "production" ? require("cssnano") : undefined,
    require("@csstools/postcss-light-dark-function"),
    wrapInScopePlugin(),
  ],
};

module.exports = config;
