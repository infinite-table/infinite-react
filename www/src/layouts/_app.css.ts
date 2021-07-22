import { style } from "@vanilla-extract/css";
import { vars } from "../styles/utils.css";

export const appClassName = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: vars.font.body,
});
