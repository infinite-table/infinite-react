import * as React from "react";
import Link from "next/link";
import { useDocsContext } from "../DocsContext";
import { docsHeadingClassName, docsHeadingFontSize } from "./index.css";

export type DocsHeadingProps = {
  children: string;
};

export const DocsHeading = (props: DocsHeadingProps & { Tag: any }) => {
  let { Tag, ...rest } = props;

  const size = {
    h1: docsHeadingFontSize.h1,
    h2: docsHeadingFontSize.h2,
    h3: docsHeadingFontSize.h3,
    h4: docsHeadingFontSize.h4,
  }[Tag];

  return (
    <Tag
      {...rest}
      className={`${docsHeadingFontSize[size]} ${docsHeadingClassName}`}
    ></Tag>
  );
};

export function DocsHeadingType1(props: DocsHeadingProps) {
  return <DocsHeading Tag={"h1"} {...props} />;
}

export function DocsHeadingType2(props: DocsHeadingProps) {
  return <DocsHeading Tag={"h2"} {...props} />;
}

export function DocsHeadingType3(props: DocsHeadingProps) {
  return <DocsHeading Tag={"h3"} {...props} />;
}

export function DocsHeadingType4(props: DocsHeadingProps) {
  return <DocsHeading Tag={"h4"} {...props} />;
}
