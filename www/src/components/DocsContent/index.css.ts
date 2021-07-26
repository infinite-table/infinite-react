import { composeStyles, style } from "@vanilla-extract/css";
import { display, flex1, flexDirection, paddingY } from "@www/styles/utils.css";

export const docsContentClassName = composeStyles(
  style({
    lineHeight: "1.75",
  }),
  display.flex,
  flexDirection.column,
  flex1,
  paddingY["16"]
);
