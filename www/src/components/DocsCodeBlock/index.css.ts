import { globalStyle, style } from "@vanilla-extract/css";
import { spaceScale, vars } from "@www/styles/utils.css";

export const docsCodeBlockClassName = style({
  background: vars.color.gray,
  display: "inline-block",
  padding: `${spaceScale["0.5"]} ${spaceScale[2]}`,
  marginTop: 1,
  borderRadius: "5px",
  position: "relative",
  cursor: "pointer",
});

export const clipboardIconClassName = style({
  position: "absolute",
  top: 2,
  right: 2,
  background: vars.color.gray,
  pointerEvents: "none",

  selectors: {
    [`${docsCodeBlockClassName} &`]: {
      visibility: "hidden",
    },
    [`${docsCodeBlockClassName}:hover &`]: {
      visibility: "visible",
    },
  },
});
