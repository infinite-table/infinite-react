import * as React from "react";
import { useRef, useState } from "react";
import SimpleCodeEditor from "react-simple-code-editor";

import Highlight, { defaultProps } from "prism-react-renderer";
import vsLight from "prism-react-renderer/themes/vsLight";

import { editorClassName, editorFullScreen } from "../index.css";

type EditorProps = {
  code: string;

  fullScreen: boolean;
  onCodeChange: (code: string) => void;

  height?: string | number;
};

const highlight = (code: string) => {
  return (
    <Highlight {...defaultProps} code={code} language={"tsx"} theme={vsLight}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <>
          <pre className={className} style={{ ...style }}>
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
export function Editor(props: EditorProps) {
  return (
    <div
      className={`${editorClassName} ${
        props.fullScreen ? editorFullScreen : ""
      }`}
      style={{
        overflow: "auto",

        minHeight: props.height,
        height: props.height,
      }}
    >
      <SimpleCodeEditor
        value={props.code}
        style={{ width: "min-content" }}
        onValueChange={props.onCodeChange}
        highlight={(code) => highlight(code)}
      />
    </div>
  );
}
