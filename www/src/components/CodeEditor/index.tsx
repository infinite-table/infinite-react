import * as React from "react";

import { mdx } from "@mdx-js/react";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import vsDark from "prism-react-renderer/themes/vsDark";
import vsLight from "prism-react-renderer/themes/vsLight";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

import {
  InfiniteTableFactory,
  DataSource,
} from "@infinite-table/infinite-react";
import { clipboardButton } from "../DocsCodeBlock";
import { borderRadius, vars } from "@www/styles/utils.css";
import humanizeString from "humanize-string";
import { docsCodeBlockClassName } from "../DocsCodeBlock/index.css";

export type CodeEditorProps = {
  children: string;
  className?: string;
  render?: any;
  live?: string | boolean;
  height?: string;
  title?: string;
};

type ValidLanguage = "jsx" | "javascript" | "typescript" | "tsx";

const languageMap = {
  ts: "typescript",
  js: "javascript",
};

const imports = `import { InfiniteTableFactory } from '@infinite-table/infinite-react'
import '@infinite-table/infinite-react/index.css'

`;
export const CodeEditor = (props: CodeEditorProps) => {
  const [renderIndex, rerender] = React.useState((x) => x + 1);

  let { children, className, render, title, live, height } = props;

  //@ts-ignore
  if (height && height == height * 1) {
    height = `${height}px`;
  }

  let language = className.replace(/language-/, "") as ValidLanguage;

  language = languageMap[language] || language;

  let code = children.trim();

  const header = (
    <div
      data-clipboard-text={code}
      className={docsCodeBlockClassName}
      title="Click to copy to clipboard"
      style={{
        display: "block",
        background: vars.color.gray,
        cursor: "pointer",
        position: "relative",
        borderRadius: borderRadius["2xl"],
        padding: vars.space[3],
        marginBottom: 10,
      }}
    >
      {title ? humanizeString(title) : null}
      {clipboardButton}
    </div>
  );
  if (live) {
    const codeOnly = code.replace(imports, "");

    return (
      <div
        style={{
          position: "relative",
          background: vars.color.white,
        }}
      >
        {header}

        <LiveProvider
          key={renderIndex}
          code={codeOnly}
          noInline
          transformCode={(code) => code.replace(imports, "")}
          scope={{ mdx, InfiniteTableFactory, DataSource }}
        >
          <LivePreview />
          <div
            style={{
              height,
              overflow: "auto",
              fontSize: vars.font.sizes.medium,
            }}
          >
            <LiveEditor
              language={language}
              theme={vsLight}
              code={imports + code}
            />
          </div>
          <LiveError />
        </LiveProvider>
      </div>
    );
  }

  // if (render) {
  //   return (
  //     <div style={{ marginTop: "40px", background: "red" }}>
  //       <LiveProvider code={children}>
  //         <LivePreview />
  //       </LiveProvider>
  //     </div>
  //   );
  // }

  return (
    <Highlight
      {...defaultProps}
      code={imports + code}
      language={language}
      theme={vsLight}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <>
          {header}
          <pre
            className={""}
            data-clipboard-text={imports + code}
            title="Click to copy to clipboard"
            style={{ ...style, height, overflow: "auto", padding: "20px" }}
          >
            {clipboardButton}
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })}></span>
                ))}
              </div>
            ))}
          </pre>
        </>
      )}
    </Highlight>
  );
};
