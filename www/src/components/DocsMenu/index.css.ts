import { composeStyles, globalStyle, style } from "@vanilla-extract/css";
import {
  display,
  flexDirection,
  padding,
  paddingLeft,
  vars,
} from "@www/styles/utils.css";

const root = style({
  lineHeight: "2.5",
  height: "100%",
  position: "sticky",
  top: 0,
});
export const docsMenuClassName = composeStyles(
  root,
  display.flex,
  flexDirection.column,
  padding["16"],
  paddingLeft[0]
);

export const linkClassName = style({
  color: vars.color.brand,
  textDecoration: "none",
  ":hover": {
    textDecoration: "underline",
  },
});
