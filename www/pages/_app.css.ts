import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const className = style({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: vars.font.body,
});
