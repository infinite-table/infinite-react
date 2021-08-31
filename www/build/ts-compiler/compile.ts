import * as ts from "typescript";

import { dts as dts_es5 } from "./lib-es5";
import { dts as dts_es2015 } from "./lib-es2015-core";
import { dts as dts_es2015_collection } from "./lib-es2015-collection";
import { dts as dts_es2015_symbol } from "./lib-es2015-symbol";
import { dts as dts_es2015_generator } from "./lib-es2015-generator";
import { dts as dts_es2015_iterable } from "./lib-es2015-iterable";
import { dts as infiniteTableDTS } from "./lib-extra";
import { dts as reactDTS } from "./dts-deps/react/react";
import { dts as globalDTS } from "./dts-deps/react/global";
import { dts as csstypeDTS } from "./dts-deps/react/deps/csstype";
import { dts as propTypesDTS } from "./dts-deps/react/deps/prop-types";
import { getDependencies } from "./getRequireStatements";

const libDTS = `${dts_es5}
${dts_es2015}
${dts_es2015_collection}
${dts_es2015_symbol}
${dts_es2015_iterable}
${dts_es2015_generator}

interface Window {}
interface Console {
  memory: any;
  assert(condition?: boolean, ...data: any[]): void;
  clear(): void;
  count(label?: string): void;
  countReset(label?: string): void;
  debug(...data: any[]): void;
  dir(item?: any, options?: any): void;
  dirxml(...data: any[]): void; 
  error(...data: any[]): void;
  exception(message?: string, ...optionalParams: any[]): void;
  group(...data: any[]): void;
  groupCollapsed(...data: any[]): void;
  groupEnd(): void;
  info(...data: any[]): void;
  log(...data: any[]): void;
  table(tabularData?: any, properties?: string[]): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  timeLog(label?: string, ...data: any[]): void;
  timeStamp(label?: string): void;
  trace(...data: any[]): void;
  warn(...data: any[]): void;
}

declare var console: Console;
declare var render: (x: any) => any;
`;

const RESOLVER_MAP = new Map<
  string,
  {
    file: string;
    code: string;
  }
>([
  [
    "@infinite-table/infinite-react",
    {
      file: "@infinite-table/infinite-react/index.ts",
      code: infiniteTableDTS,
    },
  ],
  [
    "react",
    {
      file: "node_modules/@types/react/index.d.ts",
      code: reactDTS,
    },
  ],
  [
    "csstype",
    {
      file: "node_modules/csstype/index.d.ts",
      code: csstypeDTS,
    },
  ],
  [
    "prop-types",
    {
      file: "node_modules/@types/prop-types/index.d.ts",
      code: propTypesDTS,
    },
  ],
  [
    "es2015",
    {
      file: "es2015.ts",
      code: libDTS,
    },
  ],
]);

const RESOLVED_FILE_PATHS = new Map(
  Array.from(RESOLVER_MAP.keys()).map((key) => {
    const value = RESOLVER_MAP.get(key)!;

    return [value.file, value.code];
  })
);
RESOLVED_FILE_PATHS.set("node_modules/@types/react/global.d.ts", globalDTS);

const INIT_COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  jsx: ts.JsxEmit.React,

  module: ts.ModuleKind.CommonJS,
  isolatedModules: false,
  esModuleInterop: false,
  // noEmit: false,
  // alwaysStrict: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  // allowSyntheticDefaultImports: true,
  // allowUmdGlobalAccess: true,
  // allowUnreachableCode: true,
  // alwaysStrict: false,
  // disableSolutionSearching: true,
  // disableReferencedProjectLoad: true,
  // useDefineForClassFields: false,
  rootDir: ".",
  baseUrl: ".",
  lib: ["es2015"],
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

    const location = `line ${line}, char ${character}, ${file?.fileName}`;

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

function resolveModuleNames(
  extraDependencies: Map<string, string>,
  moduleNames: string[],
  containingFile: string,
  _reusedNames: string[] | undefined,
  _redirectedReference: ts.ResolvedProjectReference | undefined,
  options: ts.CompilerOptions
): ts.ResolvedModule[] {
  const defaultFound = Array.from(RESOLVER_MAP.values()).find(
    (entry) => entry.file === containingFile
  );

  const resolvedModules: ts.ResolvedModule[] = [];
  for (const moduleName of moduleNames) {
    let foundSourceCode = RESOLVER_MAP.get(moduleName);
    if (!foundSourceCode && extraDependencies.has(moduleName)) {
      foundSourceCode = {
        file: containingFile,
        code: extraDependencies.get(containingFile)!,
      };
    }
    if (!foundSourceCode && defaultFound) {
      foundSourceCode = defaultFound;
    }

    let result = ts.resolveModuleName(moduleName, containingFile, options, {
      fileExists: () => true,
      readFile: () => {
        return foundSourceCode?.code;
      },
    });
    if (result.resolvedModule && foundSourceCode) {
      result.resolvedModule.resolvedFileName = foundSourceCode!.file;
      result.resolvedModule.isExternalLibraryImport = true;

      resolvedModules.push(result.resolvedModule);
    } else {
      throw `Module ${moduleName} cannot be resolved`;
    }
  }
  return resolvedModules;
}

export type CompileFileResult = {
  errors: { message: string; location: string }[];
  dependencies?: { path: string }[];
  result: string;
};
export const compileFile = (data: {
  code: string;
  path: string;
  compilerOptions?: Partial<ts.CompilerOptions>;
  getPreEmitDiagnostics: boolean;
  extraDependencies?: Map<string, string>;
}): CompileFileResult => {
  let {
    code,
    path = "example.tsx",
    compilerOptions,
    getPreEmitDiagnostics,
    extraDependencies = new Map<string, string>(),
  } = data;

  if (extraDependencies) {
    extraDependencies.forEach((value, key) => {
      const { result: code, errors } = compileFile({
        code: value,
        path: key.replace("./", "") + ".ts",
        getPreEmitDiagnostics: false,
        compilerOptions: {
          // noEmit: false,
          emitDeclarationOnly: true,
        },
      });

      // console.log(code);
      // process.exit();
    });
  }

  compilerOptions = {
    ...compilerOptions,
    ...INIT_COMPILER_OPTIONS,
  };

  const sourceFile = ts.createSourceFile(path, code, ts.ScriptTarget.Latest);
  const libDTSFile = ts.createSourceFile(
    "lib.d.ts",
    libDTS,
    ts.ScriptTarget.Latest
  );

  const writeMap = new Map<string, string>();
  try {
    const customCompilerHost: ts.CompilerHost = {
      getSourceFile: (name: string, languageVersion: any) => {
        if (name === sourceFile.fileName) {
          return sourceFile;
        }
        if (name === "lib.d.ts") {
          return libDTSFile;
        }

        if (RESOLVED_FILE_PATHS.get(name)) {
          return ts.createSourceFile(
            name,
            RESOLVED_FILE_PATHS.get(name)!,
            ts.ScriptTarget.Latest
          );
        }

        throw `Cannot resolve ${name}`;
      },
      writeFile: (_filename: string, data: string) => {
        // console.log("writing", _filename);
        writeMap.set(_filename, data);
      },
      resolveModuleNames: (...args) => {
        return resolveModuleNames(extraDependencies, ...args);
      },
      getDefaultLibFileName: () => "es2015.ts",
      useCaseSensitiveFileNames: () => false,
      getCanonicalFileName: (filename: string) => filename,
      getCurrentDirectory: () => "",
      getNewLine: () => "\n",
      getDirectories: () => [],
      fileExists: () => true,
      readFile: () => "",
    };

    const program = ts.createProgram(
      [sourceFile.fileName],
      // [sourceFile.fileName],
      compilerOptions,
      customCompilerHost
    );

    // console.log(writeMap);
    const diagnostics = getPreEmitDiagnostics
      ? ts.getPreEmitDiagnostics(program)
      : null;
    const errors = diagnostics ? getErrors(diagnostics) : [];
    const dependencies = getDependencies(sourceFile);

    program.emit();

    let expectedOutFileName = path.replace(".tsx", ".js");
    expectedOutFileName = expectedOutFileName.replace(".ts", ".js");
    if (expectedOutFileName.startsWith("./")) {
      expectedOutFileName = expectedOutFileName.slice(2);
    }

    const result = writeMap.get(expectedOutFileName) || "";
    // console.log({ expectedOutFileName, result });
    // console.log(writeMap.entries());
    // console.log(result);
    return {
      result,
      dependencies,
      errors,
    };
  } catch (ex) {
    throw ex;
  }
};

export const compileProgram = (
  source: string,
  fileName: string,
  extraDependencies?: Map<string, string>
) => {
  let result: CompileFileResult;

  try {
    result = compileFile({
      code: source,
      path: fileName || "example.tsx",
      getPreEmitDiagnostics: true,
      extraDependencies,
    });

    const deps = result.dependencies || [];

    deps.forEach((dep) => {
      let knownDep =
        dep.path.startsWith("@infinite-table/infinite-react") ||
        dep.path === "react";
      if (!knownDep && extraDependencies) {
        knownDep = extraDependencies.has(dep.path);
      }

      if (!knownDep) {
        result.errors.push({
          message: `Imports are only supported from "@infinite-table/infinite-react" or "react". Any other imports are not supported.`,
          location: "",
        });
      }
    });
  } catch (ex) {
    result = {
      errors: [{ message: `${ex}`, location: "" }],
      result: "",
    };
  }

  return result;
};
