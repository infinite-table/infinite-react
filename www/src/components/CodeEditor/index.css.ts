import { style } from "@vanilla-extract/css";
import { spaceScale, vars } from "@www/styles/utils.css";

export const languageClassName = style({
  marginRight: vars.space[1],
  background: vars.color.white,
  padding: vars.space[1],
  // border: "5px solid transparent",
  opacity: 0.6,
});

export const selectedClassName = style({
  // border: `5px solid ${vars.color.brand}`,
  opacity: 1,
});
