import { globalStyle, style } from "@vanilla-extract/css";
import {
  borderRadius,
  screenSizes,
  spaceScale,
  vars,
} from "@www/styles/utils.css";

export const languageClassName = style({
  marginRight: vars.space[1],
  background: vars.color.white,
  padding: vars.space[1],

  opacity: 0.6,
});

export const selectedClassName = style({
  // border: `5px solid ${vars.color.brand}`,
  opacity: 1,
});

const editorSeparatorStyle = {
  paddingLeft: 10,
  borderLeft: `1px solid ${vars.color.gray}`,
  marginLeft: 10,
  flex: 1,
};

export const editorClassName = style({
  "@media": {
    [`screen and (min-width: ${screenSizes["screen-xl"]})`]:
      editorSeparatorStyle,
  },
});

export const editorFullScreen = style(editorSeparatorStyle);

// we force all elements have same font family
// and font size, since <pre> elements used for formatting
// have a different inherited style, and the overlayed textarea
// is not perfectly aligned if it has other sizes
globalStyle(`${editorClassName} *`, {
  fontFamily:
    "ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace",
  fontSize: "1em",
});

// also textarea needs a zIndex for the cursor to be visible
globalStyle(`${editorClassName} textarea`, {
  zIndex: 100,
  outline: "none",
});

export const errorClassName = style({
  color: "red",
  background: vars.color.errBackground,
  padding: spaceScale[2],
  borderRadius: borderRadius["sm"],
});

export const editorWrapperClassName = style({
  display: "flex",
  flexDirection: "column",
  "@media": {
    [`screen and (min-width: ${screenSizes["screen-xl"]})`]: {
      flexDirection: "row",
    },
  },
});

export const editorWrapperFullScreen = style({
  flexDirection: "row",
  top: 74, //TODO update this
  bottom: 0,
  left: 0,
  right: 0,
  position: "absolute",
});

globalStyle(`${editorWrapperClassName} .ITable`, {
  height: "100%",
});
