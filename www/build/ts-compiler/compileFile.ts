import * as ts from "typescript";

import { dts as dts_es5 } from "./lib-es5";
import { dts as dts_es2015 } from "./lib-es2015-core";
import { dts as dts_es2015_collection } from "./lib-es2015-collection";
import { getDependencies } from "./getRequireStatements";

const libDTS = `${dts_es5}
${dts_es2015}
${dts_es2015_collection}
`;

const INIT_COMPILER_OPTIONS: ts.CompilerOptions = {
  noImplicitUseStrict: true,
  target: ts.ScriptTarget.ES5,
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  rootDir: ".",
  baseUrl: ".",
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

const getErrors = (diagnostics: undefined | readonly ts.Diagnostic[]) => {
  let errors: CompileError[] = [];
  if (diagnostics) {
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
  }

  return errors;
};

export const compileFile = (data: {
  code: string;
  path: string;
  compilerOptions?: Partial<ts.CompilerOptions>;
}) => {
  let { code, path = "example.ts", compilerOptions } = data;

  compilerOptions = {
    ...compilerOptions,
    ...INIT_COMPILER_OPTIONS,
  };

  const transpiled = ts.transpileModule(code, {
    compilerOptions,
    fileName: path,
    reportDiagnostics: true,
  });

  const sourceFile = ts.createSourceFile(
    path,
    transpiled.outputText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const dependencies = getDependencies(sourceFile);

  console.log("deps", dependencies);

  try {
    const diagnostics = transpiled.diagnostics;
    console.log(diagnostics, "!!!");
    // const errors = getErrors(diagnostics);

    // program.emit();

    return {
      result: transpiled.outputText,
      errors: [],
    };
  } catch (ex) {
    throw ex;
  }
};
