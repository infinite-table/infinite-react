import { style, styleVariants } from "@vanilla-extract/css";
import { fontSizeScale, vars } from "@www/styles/utils.css";

export const docsHeadingFontSize = styleVariants(
  {
    h1: fontSizeScale["6xl"],
    h2: fontSizeScale["5xl"],
    h3: fontSizeScale["4xl"],
    h4: fontSizeScale["3xl"],
  },
  (value) => {
    return {
      fontSize: value,
    };
  }
);

export const docsHeadingClassName = style({
  color: vars.color.brandDark,
});
