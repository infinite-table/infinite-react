import * as React from "react";

import * as InfiniteTable from "@infinite-table/infinite-react";

import { useMemo, useRef, useState } from "react";
import { errorClassName } from "./index.css";
import { compile } from "./compile";
import { Editor } from "./Editor";

const debounce = require("debounce");
const dashify = require("dashify");

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

type CodeError = {
  message: string;
  location: string;
};
function Errors({ errors }: { errors: CodeError[] }) {
  return (
    <div>
      {errors.map((err) => {
        return (
          <div
            className={errorClassName}
            key={`${err.message}-${err.location}`}
          >
            <div>{err.location}</div>
            <div>{err.message}</div>
          </div>
        );
      })}
    </div>
  );
}

export const CodeEditor = (props: CodeEditorProps) => {
  let { children, title, live, height } = props;

  //@ts-ignore
  if (height && height == height * 1) {
    height = `${height}px`;
  }

  const [fileName] = useState(() => {
    return dashify(title) + ".tsx";
  });

  let [code, setCode] = useState(() => children.trim());

  const [errors, setErrors] = useState<CodeError[]>([]);

  const previewRef = useRef<JSX.Element>(null);
  const compiledCode = useRef("");

  const getPreview = (code: string) => {
    const { result, errors } = compile(code, fileName);

    let preview = previewRef.current;
    let updated: boolean = false;

    if (!errors.length) {
      if (result !== compiledCode.current) {
        preview = <CodePreview transpiledCode={result} />;
        updated = true;
        compiledCode.current = result;
      }
    }
    return {
      updated,
      preview,
      result,
      errors,
    };
  };

  const [preview, setPreview] = useState<JSX.Element | null>(() => {
    return getPreview(code).preview;
  });

  const onCodeChange = useMemo(() => {
    const transpile = debounce((code: string) => {
      const { updated, preview, errors } = getPreview(code);

      if (updated) {
        setPreview(preview);
      }
      setErrors(errors);
    }, 500);

    return (code: string) => {
      setCode(code);
      transpile(code);
    };
  }, []);

  const editor = (
    <Editor
      onCodeChange={onCodeChange}
      hasError={!!errors.length}
      code={code}
      title={title}
      height={height}
    />
  );
  if (live) {
    return (
      <>
        {preview}
        {editor}
        <Errors errors={errors} />
      </>
    );
  }

  return editor;
};
