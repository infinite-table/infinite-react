import * as React from "react";
import {
  display,
  centeredFlexColumn,
  backgroundColorWhite,
  colorBrandDark,
  shadow,
  alignSelf,
} from "../styles/utils.css";
import { footer, width100 } from "./components.css";

export const Footer = (props) => {
  return (
    <footer
      className={`${footer} ${alignSelf.flexEnd} ${width100} ${display.flex} ${centeredFlexColumn} ${shadow.lg} ${backgroundColorWhite} ${colorBrandDark}`}
    >
      Copyright © {new Date().getFullYear()} Infinite Table
      {props.children}
    </footer>
  );
};
