import * as ts from "typescript";

import { dts as dts_es5 } from "./lib-es5";
import { dts as dts_es2015 } from "./lib-es2015-core";
import { dts as dts_es2015_collection } from "./lib-es2015-collection";
import { dts as dts_lib_extra } from "./lib-extra";
import {
  csstypeFile,
  csstypePath,
  dts as dts_react,
  globalReactFile,
  globalReactPath,
  proptypesFile,
  proptypesPath,
  reactFile,
  reactPath,
} from "./dts-deps/react/export";

const libDTS = `${dts_es5}
${dts_es2015}
${dts_es2015_collection}
`;

const compilerOptions: ts.CompilerOptions = {
  noImplicitUseStrict: true,
  target: ts.ScriptTarget.ES5,
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  inlineSources: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  rootDir: ".",
  paths: {
    react: ["react.ts"],
    "react/*": ["react.ts"],
  },

  lib: [],
};
type CompileError = { message: string; location: string };

const getMessageChainsErrors = (
  next: ts.DiagnosticMessageChain[],
  location: string,
  errors: CompileError[] = []
) => {
  for (let current of next) {
    errors.push({
      message: current.messageText,
      location,
    });
    if (current.next) {
      getMessageChainsErrors(current.next, location, errors);
    }
  }

  return errors;
};

const getErrors = (diagnostics: readonly ts.Diagnostic[]) => {
  let errors: CompileError[] = [];
  for (const diagnostic of diagnostics) {
    let message = diagnostic.messageText;
    const file = diagnostic.file!;

    const lineAndChar = file
      ? file.getLineAndCharacterOfPosition(diagnostic.start!)
      : { line: 1, character: 1 };

    const line = lineAndChar.line + 1;
    const character = lineAndChar.character + 1;

    const location = `line ${line}, char ${character}, ${file.fileName}`;

    console.log(message);
    errors.push({
      message: typeof message === "string" ? message : message.messageText,
      location,
    });

    if (typeof message !== "string" && message.next) {
      getMessageChainsErrors(message.next, location, errors);
    }
  }

  return errors;
};

const infiniteTypesPath = "node_modules/@infinite-table/infinite-react.ts";

export const compile = (code: string, extraDTS?: string) => {
  let result = null;
  const filename = "example.ts";

  const sourceFile = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest
  );

  const infiniteTypes = ts.createSourceFile(
    infiniteTypesPath,
    dts_lib_extra,
    ts.ScriptTarget.Latest
  );
  // const reactTypes1 = ts.createSourceFile(
  //   reactPath1,
  //   dts_react,
  //   ts.ScriptTarget.Latest
  // );
  // const reactTypes2 = ts.createSourceFile(
  //   reactPath2,
  //   dts_react,
  //   ts.ScriptTarget.Latest
  // );

  const allDTS = `${libDTS}
  
${extraDTS || ""}`;

  try {
    const defaultCompilerHost = ts.createCompilerHost(compilerOptions);
    defaultCompilerHost.readFile = () => allDTS;

    const customCompilerHost: ts.CompilerHost = {
      getSourceFile: (name: string, languageVersion: any) => {
        console.log("requesting file:", name);

        if (name === infiniteTypesPath) {
          console.log("found infinite");
          return infiniteTypes;
        }
        if (name === reactPath) {
          console.log("found react");
          return reactFile;
        }
        if (name === globalReactPath) {
          console.log("found global react");
          return globalReactFile;
        }
        if (name === csstypePath) {
          console.log("found csstype");
          return csstypeFile;
        }
        if (name === proptypesPath) {
          console.log("found proptypes");
          return proptypesFile;
        }
        if (name === filename) {
          console.log("found example");
          return sourceFile;
        } else {
          console.log("returning ... ", name);
          return defaultCompilerHost.getSourceFile(name, languageVersion);
        }
      },
      writeFile: (_filename: string, data: string) => {
        result = data;
      },
      getDefaultLibFileName: () => "lib.d.ts",
      useCaseSensitiveFileNames: () => false,
      getCanonicalFileName: (filename: string) => filename,
      getCurrentDirectory: () => "",
      getNewLine: () => "\n",
      getDirectories: () => [],
      fileExists: () => true,
      readFile: () => allDTS,
    };

    const program = ts.createProgram([filename], {}, customCompilerHost);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const errors = getErrors(diagnostics);

    program.emit();

    return {
      result,
      errors,
    };
  } catch (ex) {
    throw ex;
  }
};
