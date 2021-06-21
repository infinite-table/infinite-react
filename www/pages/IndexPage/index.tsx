import Head from "next/head";

import * as React from "react";

import {
  backgroundColorBrand,
  backgroundColorBrandDark,
  backgroundColorWhite,
  borderRadius,
  colorWhite,
  fontSize,
  marginBottom,
  marginTop,
  padding,
  paddingX,
  paddingY,
  fontWeight,
  zIndex,
  maxWidth,
  textAlign,
  centeredFlexColumn,
  display,
  flex1,
  position,
  shadow,
} from "../../styles/theme.css";
import { container, title, width100 } from "./index.css";

import { Cards } from "./Cards";
import { GetAccessForm } from "./GetAccessForm";
import { Footer } from "./Footer";

const ReactLogo = (
  <img
    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
    alt=""
    height="5"
    width="20"
    className={display.inlineBlock}
  ></img>
);

const Header = (props: { title: string }) => {
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
      <div className={`${position.relative}`}>
        <img
          width={150}
          height={70}
          src="/logo-infinite.svg"
          className={zIndex[10]}
        />
      </div>

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

export function IndexPage() {
  return (
    <div className={`${container} ${backgroundColorBrand}`}>
      <Head>
        <title>Infinite Table for React</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"></link>
      </Head>

      <Header title="Infinite Table" />
      <main
        className={`${centeredFlexColumn} ${flex1} ${paddingX[0]} ${position.relative} `}
      >
        <div
          className={[
            shadow.lg,
            position.absolute,
            backgroundColorBrandDark,
            fontWeight.bold,
            colorWhite,
            fontSize.sm,
            padding[3],
            borderRadius.md,
            zIndex["0"],
          ].join(" ")}
          style={{ top: "-3.5rem" }}
        >
          COMING SOON for REACT {ReactLogo}
        </div>

        <div
          className={[
            padding[5],
            marginTop[20],
            maxWidth["7xl"],
            paddingX[20],
            textAlign.center,
            colorWhite,
          ].join(" ")}
        >
          <p className={`${fontSize["2xl"]}`}>
            <b>Infinite Table</b> for React {ReactLogo} is a UI component for
            data virtualization.
          </p>
          <p className={`${marginTop[6]} ${fontSize.xl}`}>
            Huge datasets are no longer a problem!
          </p>
        </div>

        <Cards />

        <GetAccessForm />
      </main>

      <Footer />
    </div>
  );
}
