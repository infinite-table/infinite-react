import { composeStyles, globalStyle, style } from "@vanilla-extract/css";
import { display, flexDirection, vars } from "@www/styles/utils.css";

const root = style({
  lineHeight: "2.5",
  height: "100%",
  position: "sticky",
  top: 0,
  paddingTop: vars.space[12],
  paddingBottom: vars.space[12],
  paddingRight: vars.space[12],
  paddingLeft: 0,
  "@media": {
    "screen and (max-width: 1270px)": {
      paddingRight: vars.space[3],
    },
  },
});
export const docsMenuClassName = composeStyles(
  root,
  display.flex,
  flexDirection.column
);

export const linkClassName = style({
  color: vars.color.brand,
  textDecoration: "none",
  ":hover": {
    textDecoration: "underline",
  },
});
