import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { fontSizeScale, vars } from "@www/styles/utils.css";

const offsetMarginForAdjustingFixedHeader = "110px";

export const docsHeadingFontSize = styleVariants(
  {
    h1: fontSizeScale["4xl"],
    h2: fontSizeScale["3xl"],
    h3: fontSizeScale["2xl"],
    h4: fontSizeScale["xl"],
  },
  (value) => {
    return {
      fontSize: value,
      paddingTop: `calc(${offsetMarginForAdjustingFixedHeader} + ${value})`,
      // paddingTop: value,
      marginTop: `-${offsetMarginForAdjustingFixedHeader}`,
      paddingBottom: value,
    };
  }
);

export const docsHeadingClassName = style({
  color: vars.color.brandDark,
});
export const docsHeadingLinkClassName = style({
  textDecoration: "none",
  overflow: "hidden",
});

globalStyle(
  `${docsHeadingLinkClassName}:first-child > ${docsHeadingClassName}`,
  {
    paddingTop: `${offsetMarginForAdjustingFixedHeader}`,
  }
);
