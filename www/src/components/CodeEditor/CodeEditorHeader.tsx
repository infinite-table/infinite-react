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
  fullScreen: boolean;
  toggleFullScreen: () => void;
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
        width: "100%",
        marginBottom: 10,
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
      <div style={{ flex: 1 }} />
      <div style={{ position: "relative", top: -8 }}>{clipboardButton}</div>
      <svg
        onClick={props.toggleFullScreen}
        enable-background="new 0 0 24 24"
        height={16}
        viewBox="0 0 24 24"
        width={16}
        fill="currentColor"
      >
        {props.fullScreen ? (
          <path d="M22,3.41l-5.29,5.29L20,12h-8V4l3.29,3.29L20.59,2L22,3.41z M3.41,22l5.29-5.29L12,20v-8H4l3.29,3.29L2,20.59L3.41,22z" />
        ) : (
          <polygon points="21,11 21,3 13,3 16.29,6.29 6.29,16.29 3,13 3,21 11,21 7.71,17.71 17.71,7.71" />
        )}
      </svg>
    </div>
  );
};
