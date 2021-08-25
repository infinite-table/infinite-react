import {
  borderRadius,
  display,
  flexDirection,
  padding,
  vars,
} from "@www/styles/utils.css";
import * as React from "react";
import humanizeString from "humanize-string";
import { docsCodeBlockClassName } from "../DocsCodeBlock/index.css";
import { languageClassName, selectedClassName } from "./index.css";
import { clipboardButton } from "../DocsCodeBlock";

type CodeEditorHeaderProps = {
  title?: string;
  clipboardCode?: string;
  ts: boolean;
  hasError: boolean;
  // onLanguageChange: (ts: boolean) => void;
};

export const CodeEditorHeader = (props: CodeEditorHeaderProps) => {
  const domProps: React.HTMLProps<HTMLDivElement> = {};

  if (props.clipboardCode) {
    (domProps as any)["data-clipboard-text"] = props.clipboardCode;
    domProps.title = "Click to copy to clipboard";
  }

  const iconSize = 20;
  const languageStyle: React.CSSProperties = {
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
  };

  return (
    <div
      {...domProps}
      className={docsCodeBlockClassName}
      style={{
        background: props.hasError ? vars.color.errBackground : vars.color.gray,
        cursor: "pointer",
        position: "relative",
        borderRadius: borderRadius["2xl"],
      }}
    >
      <div
        className={`${flexDirection.row} ${display.inlineFlex} ${padding["2"]}`}
      >
        {/*<div
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
        </div>*/}
        <div
          className={`${
            props.ts ? selectedClassName : ""
          } ${languageClassName}`}
          style={{ ...languageStyle, backgroundColor: "#0288d1" }}
          // title="Switch to TypeScript"
          title="TypeScript"
          // onClick={() => {
          //   if (!props.ts) {
          //     props.onLanguageChange(true);
          //   }
          // }}
        >
          <img src={"/ts-logo.svg"} width={iconSize} height={iconSize} />
        </div>
      </div>
      {props.title ? humanizeString(props.title) : null}
      {clipboardButton}
    </div>
  );
};
