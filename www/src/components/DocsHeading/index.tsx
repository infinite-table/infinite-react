import * as React from "react";
import Link from "next/link";

import {
  docsHeadingClassName,
  docsHeadingFontSize,
  docsHeadingLinkClassName,
} from "./index.css";
const dashify = require("dashify");

export type DocsHeadingProps = {
  children: string;
};

export const DocsHeading = (props: DocsHeadingProps & { Tag: any }) => {
  let { Tag, children } = props;

  //@ts-ignore
  const size = {
    h1: docsHeadingFontSize.h1,

    h2: docsHeadingFontSize.h2,

    h3: docsHeadingFontSize.h3,

    h4: docsHeadingFontSize.h4,
  }[Tag];

  const id = dashify(children);

  return (
    <Link href={`#${id}`}>
      <a className={docsHeadingLinkClassName}>
        <Tag id={id} className={`${size} ${docsHeadingClassName}`}>
          {children}
        </Tag>
      </a>
    </Link>
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
