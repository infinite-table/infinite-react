import { style } from "@vanilla-extract/css";
import { spaceScale, vars } from "@www/styles/utils.css";

export const docsCodeBlockClassName = style({
  background: vars.color.gray,
  display: "inline-flex",
  alignItems: "center",
  padding: `${spaceScale["0.5"]} ${spaceScale[2]}`,
  fontFamily: "RobotoMono",
  marginTop: 1,
  borderRadius: "5px",
  position: "relative",
  cursor: "pointer",
});

export const clipboardIconClassName = style({
  position: "absolute",
  top: "auto",
  bottom: "auto",
  right: spaceScale[2],
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
