import * as React from "react";
import { docsContentClassName } from "./index.css";
import { HTMLProps } from "react";

export type DocsContentItem = {
  path: string;
  label: string;
};
type DocsContentProps = HTMLProps<HTMLDivElement>;
export const DocsContent = (props: DocsContentProps) => {
  return (
    <div
      {...props}
      className={`${docsContentClassName} ${props.className || ""}`}
    ></div>
  );
};
