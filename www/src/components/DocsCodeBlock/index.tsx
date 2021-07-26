import * as React from "react";
import { CodeEditor } from "../CodeEditor";
import { docsCodeBlockClassName, clipboardIconClassName } from "./index.css";

export type DocsCodeBlockProps = {
  children: string;
};

export const clipboardButton = (
  <svg
    className={clipboardIconClassName}
    height="16px"
    viewBox="0 0 24 24"
    width="16px"
    fill="currentColor"
  >
    <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
  </svg>
);
export const DocsCodeBlock = (props: DocsCodeBlockProps) => {
  let { children } = props;

  if (typeof children !== "string") {
    //@ts-ignore
    const p: any = React.Children.only(children)?.props ?? {};
    return <CodeEditor className="" {...p} />;
  }

  return (
    <pre className={docsCodeBlockClassName}>
      <code data-clipboard-text={children} title="Click to copy to clipboard">
        {children}
      </code>
      {clipboardButton}
    </pre>
  );
};
