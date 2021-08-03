import * as React from "react";

import { mdx } from "@mdx-js/react";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
// import vsDark from "prism-react-renderer/themes/vsDark";
import vsLight from "prism-react-renderer/themes/vsLight";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

import * as InfiniteTable from "@infinite-table/infinite-react";
import { clipboardButton } from "../DocsCodeBlock";
import {
  borderRadius,
  display,
  flexDirection,
  padding,
  vars,
} from "@www/styles/utils.css";
import humanizeString from "humanize-string";
import { docsCodeBlockClassName } from "../DocsCodeBlock/index.css";
import { CSSProperties, useState } from "react";
import { languageClassName, selectedClassName } from "./index.css";
import { compile } from "./compile";

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
  ts: "typescript" as "typescript",
  tsx: "typescript" as "typescript",
  typescript: "typescript" as "typescript",
  js: "javascript" as "javascript",
  javascript: "javascript" as "javascript",
  jsx: "javascript" as "javascript",
};

type CodeEditorHeaderProps = {
  title?: string;
  clipboardCode?: string;
  ts: boolean;
  onLanguageChange: (ts: boolean) => void;
};
export const CodeEditorHeader = (props: CodeEditorHeaderProps) => {
  const domProps: React.HTMLProps<HTMLDivElement> = {};

  if (props.clipboardCode) {
    (domProps as any)["data-clipboard-text"] = props.clipboardCode;
    domProps.title = "Click to copy to clipboard";
  }

  const iconSize = 20;
  const languageStyle: CSSProperties = {
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
  };

  return (
    <div
      {...domProps}
      className={docsCodeBlockClassName}
      style={{
        display: "block",
        background: vars.color.gray,
        cursor: "pointer",
        position: "relative",
        borderRadius: borderRadius["2xl"],
        // padding: vars.space[3],
        marginBottom: 10,
      }}
    >
      <div
        className={`${flexDirection.row} ${display.inlineFlex} ${padding["2"]}`}
      >
        <div
          className={`${
            !props.ts ? selectedClassName : ""
          } ${languageClassName}`}
          style={{ ...languageStyle, backgroundColor: "#ffc000" }}
          title="Switch to JavaScript"
          onClick={() => {
            if (props.ts) {
              props.onLanguageChange(false);
            }
          }}
        >
          <img src={"/jslogo.svg"} width={iconSize} height={iconSize} />
        </div>
        <div
          className={`${
            props.ts ? selectedClassName : ""
          } ${languageClassName}`}
          style={{ ...languageStyle, backgroundColor: "#0288d1" }}
          title="Switch to TypeScript"
          onClick={() => {
            if (!props.ts) {
              props.onLanguageChange(true);
            }
          }}
        >
          <img src={"/ts-logo.svg"} width={iconSize} height={iconSize} />
        </div>
      </div>
      {props.title ? humanizeString(props.title) : null}
      {clipboardButton}
    </div>
  );
};

type CodePreviewProps = {
  transpiledCode: string;
};
const CodePreview = (props: CodePreviewProps) => {
  const renderFn = React.useMemo(() => {
    const fn = new Function(
      "require",
      "render",
      "exports",
      props.transpiledCode
    );

    return fn;
  }, [props.transpiledCode]);

  const [content, setContent] = useState<React.ReactNode>(null);

  React.useEffect(() => {
    const render = (el: React.ReactNode) => {
      setContent(el);
    };
    const require = (what: string) => {
      if (what === "@infinite-table/infinite-react") {
        return InfiniteTable;
      }
      if (what === "react") {
        return React;
      }
    };
    const exports = {};
    renderFn(require, render, exports);
  }, [renderFn]);

  return <>{content}</>;
};

export const CodeEditor = (props: CodeEditorProps) => {
  let { children, className, title, live, height } = props;
  className = className ?? "language-tsx";

  //@ts-ignore
  if (height && height == height * 1) {
    height = `${height}px`;
  }

  let language = className.replace(/language-/, "") as ValidLanguage;

  language = languageMap[language] || language;

  const [theLanguage, setTheLanguage] = useState(language);

  const IS_TS = theLanguage === "typescript";

  let code = children.trim();

  const header = (
    <CodeEditorHeader
      ts={IS_TS}
      onLanguageChange={(ts) => {
        setTheLanguage(ts ? "typescript" : "javascript");
      }}
      title={title}
      clipboardCode={code}
    />
  );

  const compilationResult = compile(code);

  if (live) {
    const transformCode = (code: string) => compile(code).result as string;

    return (
      <div
        style={{
          position: "relative",
          background: vars.color.white,
        }}
      >
        {header}
        <CodePreview transpiledCode={compilationResult.result} />
        {/*}
        <LiveProvider code={code} noInline scope={{ mdx }}>
          <div
            style={{
              height,
              overflow: "auto",
              fontSize: vars.font.sizes.medium,
            }}
          >
            <LiveEditor language={language} theme={vsLight} />
          </div>
          <LiveError />
          </LiveProvider>*/}
      </div>
    );
  }

  return (
    <Highlight
      {...defaultProps}
      code={code}
      language={theLanguage}
      theme={vsLight}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <>
          {header}
          <pre
            className={""}
            data-clipboard-text={code}
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
