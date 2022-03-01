// This file is intended to contain base styles and colors for light and dark themes to be used with emotion.
// We have the web colors first, followed by MacOS/Webkit only colors. This way, the Apple System colors override the web colors, if the browser knows about them.
import { css } from '@emotion/react'

export default {
  secondaryLabel: css`
    @media (prefers-color-scheme: light) {
      color: #bebebe;
      /* MacOS, WebKit */
      color: -apple-system-secondary-label;
    }
    @media (prefers-color-scheme: dark) {
      color: #999999;
      /* MacOS, WebKit */
      color: -apple-system-secondary-label;
    }
  `,
  textBackground: css`
    /* Styles for web followed by overrides for macOS (only available to native). Order matters here. */
    @media (prefers-color-scheme: light) {
      /* Web */
      background-color: white;
      /* MacOS, WebKit */
      background-color: -apple-system-text-background;
    }
    @media (prefers-color-scheme: dark) {
      /* Web */
      background-color: #68686a;
      /* MacOS, WebKit */
      background-color: -apple-system-tertiary-label;
    }
  `,
}
