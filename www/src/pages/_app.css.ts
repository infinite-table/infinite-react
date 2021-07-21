import { style } from "@vanilla-extract/css";
import { vars } from "../styles/main.css";

export const appClassName = style({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: vars.font.body,
});
