import * as React from "react";

import {
  backgroundColorWhite,
  fontSize,
  marginBottom,
  marginTop,
  paddingY,
  fontWeight,
  zIndex,
  centeredFlexColumn,
  position,
  shadow,
} from "../styles/utils.css";

import { title, width100 } from "./components.css";

export const Header = (props: { title: string }) => {
  return (
    <div
      className={[
        position.relative,
        backgroundColorWhite,
        shadow.md,
        marginBottom[10],
        paddingY[16],
        width100,
        centeredFlexColumn,
      ].join(" ")}
    >
      <a className={`${position.relative}`} href="/">
        <img
          width={150}
          height={70}
          src="/logo-infinite.svg"
          className={zIndex[10]}
        />
      </a>

      <h1
        className={[
          title,
          marginTop[8],
          marginBottom[0],
          fontSize["4xl"],
          fontWeight.inherit,
        ].join(" ")}
      >
        {props.title}
      </h1>
    </div>
  );
};
