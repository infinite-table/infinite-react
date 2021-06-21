import * as React from "react";
import {
  display,
  centeredFlexColumn,
  backgroundColorWhite,
  colorBrandDark,
  shadow,
} from "../../styles/theme.css";
import { footer, width100 } from "./index.css";

export const Footer = (props) => {
  return (
    <footer
      className={`${footer} ${width100} ${display.flex} ${centeredFlexColumn} ${shadow.lg} ${backgroundColorWhite} ${colorBrandDark}`}
    >
      Copyright © {new Date().getFullYear()} Infinite Table
      {props.children}
    </footer>
  );
};
