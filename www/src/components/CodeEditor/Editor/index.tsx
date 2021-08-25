import * as React from "react";
import { useRef, useState } from "react";
import SimpleCodeEditor from "react-simple-code-editor";

import Highlight, { defaultProps } from "prism-react-renderer";
import vsLight from "prism-react-renderer/themes/vsLight";
import { CodeEditorHeader } from "../CodeEditorHeader";
import { clipboardButton } from "@www/components/DocsCodeBlock";
import { spaceScale } from "@www/styles/utils.css";
import { editorClassName } from "../index.css";
import { useEffect } from "react";

type EditorProps = {
  code: string;
  hasError: boolean;
  onCodeChange: (code: string) => void;
  title?: string;
  height?: string | number;
};

const highlight = (code: string, title?: string, height?: string | number) => {
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
    <>
      <CodeEditorHeader
        ts={true}
        hasError={props.hasError}
        title={props.title}
        clipboardCode={props.code}
      />
      <div
        className={editorClassName}
        style={{
          height: props.height,
          overflow: "auto",
        }}
      >
        <SimpleCodeEditor
          value={props.code}
          onValueChange={props.onCodeChange}
          highlight={(code) => highlight(code, props.title, props.height)}
        />
      </div>
    </>
  );
}
