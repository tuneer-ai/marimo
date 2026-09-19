/* Copyright 2026 Marimo. All rights reserved. */
import { memo, type PropsWithChildren, useLayoutEffect } from "react";
import { isEmbedded } from "./embed-target";
import { useTheme } from "./useTheme";

/**
 * Marimo's theme provider.
 *
 * When marimo owns the whole page (its own server-rendered index.html), the
 * theme classes are applied directly to `document.body`, as before.
 *
 * When mounted into a host page's own container (see `src/mount.tsx`), the
 * theme classes are instead applied to an extra wrapper element rendered
 * *inside* the mount container, rather than `document.body` -- mutating
 * `document.body` would leak marimo's dark/light theme onto the host page's
 * own UI, since `document.body` is shared with it. A wrapper is used instead
 * of the mount container itself so Tailwind's `.dark <selector>` dark-mode
 * variant (a descendant combinator) still matches once the embed bundle's
 * CSS is scoped under the mount container's own class (see
 * postcss.config.embed.cjs) -- the theme class needs to be on a descendant
 * of that scope, not the same element.
 */
export const ThemeProvider: React.FC<PropsWithChildren> = memo(
  ({ children }) => {
    const { theme } = useTheme();
    const embedded = isEmbedded();

    useLayoutEffect(() => {
      if (embedded) {
        return;
      }
      document.body.classList.add(theme, `${theme}-theme`);
      document.body.dataset.theme = theme;
      return () => {
        document.body.classList.remove(theme, `${theme}-theme`);
        delete document.body.dataset.theme;
      };
    }, [theme, embedded]);

    if (embedded) {
      return (
        <div className={`contents ${theme} ${theme}-theme`} data-theme={theme}>
          {children}
        </div>
      );
    }

    return children;
  },
);
ThemeProvider.displayName = "ThemeProvider";

export const CssVariables: React.FC<{
  variables: Record<`--marimo-${string}`, string>;
  children: React.ReactNode;
}> = ({ variables, children }) => {
  return (
    <div className="contents" style={variables}>
      {children}
    </div>
  );
};
