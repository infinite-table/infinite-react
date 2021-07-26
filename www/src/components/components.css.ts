import { composeStyles, globalStyle, style } from "@vanilla-extract/css";

import {
  centeredFlexColumn,
  centeredFlexRow,
  maxWidth,
  paddingX,
  vars,
} from "@www/styles/utils.css";

export const width100 = style({
  width: "100%",
});
export const footer = composeStyles(
  centeredFlexRow,
  width100,
  style({
    minHeight: 100,
  })
);

globalStyle(`${footer} img`, {
  marginLeft: "0.5rem",
});

globalStyle(`${footer} a`, {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const minHeightFull = style({
  minHeight: "100vh",
});

export const fullWidthContainer = composeStyles(centeredFlexColumn, width100);
export const container = composeStyles(
  maxWidth["7xl"],
  paddingX["3"],
  style({
    width: "100%",
  })
);

export const submitButton = style({
  selectors: {
    "&:hover": {
      background: vars.color.white,
      color: vars.color.brand,
    },
  },
  alignSelf: "center",
  borderColor: vars.color.white,
  borderWidth: 2,
});

globalStyle(`${submitButton}`, {
  transition:
    "color 0.35s ease, border-color 0.35s ease,background-color 0.35s ease",
});

export const title = style({
  lineHeight: 1.15,
});

globalStyle(`${title} a`, {
  textDecoration: "none",
  textAlign: "left",
});

globalStyle(`${title} a:hover`, {
  textDecoration: "underline",
});
globalStyle(`${title} a:focus`, {
  textDecoration: "underline",
});
globalStyle(`${title} a:active`, {
  textDecoration: "underline",
});

export const grid = style({
  "@media": {
    "screen and (max-width: 600px)": {
      width: "90%",
      flexDirection: "column",
    },
  },
});

export const card = style({
  flexBasis: "45%",
  padding: "1.5rem",
  textAlign: "left",
  textDecoration: "none",
  position: "relative",
  transition: "top 0.25s",
  top: 0,
  selectors: {
    "&:hover": {
      top: "-3px",
      opacity: 90,
      color: vars.color.brand,
      background: vars.color.white,
    },
    "&:active": {
      background: vars.color.white,
      color: vars.color.brand,
    },
  },
});

globalStyle(`${card} a`, {
  textDecoration: "none",
});
globalStyle(`${card}`, {
  transition:
    "color 0.35s ease, border-color 0.35s ease,background-color 0.35s ease",
});

globalStyle(`${card} h3`, {
  margin: "0 0 1rem 0",
  fontSize: "1.5rem",
});
globalStyle(`${card} p`, {
  margin: "0",
  lineHeight: "1.5",
});

export const email = style({
  boxShadow:
    "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(59, 130, 246, 0.5) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
});
