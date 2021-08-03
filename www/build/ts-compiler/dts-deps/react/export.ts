import * as ts from "typescript";

import { dts } from "./react";

import { dts as dts_global_react } from "./global";
import { dts as dts_csstype } from "./deps/csstype";
import { dts as dts_proptypes } from "./deps/prop-types";

export { dts_global_react, dts };

export const globalReactPath = "node_modules/global.d.ts";
export const csstypePath = "node_modules/csstype.ts";
export const proptypesPath = "node_modules/prop-types.ts";
export const reactPath = "node_modules/react.ts";

export const globalReactFile = ts.createSourceFile(
  globalReactPath,
  dts_global_react,
  ts.ScriptTarget.Latest
);
export const reactFile = ts.createSourceFile(
  reactPath,
  dts,
  ts.ScriptTarget.Latest
);

export const csstypeFile = ts.createSourceFile(
  csstypePath,
  dts_csstype,
  ts.ScriptTarget.Latest
);

export const proptypesFile = ts.createSourceFile(
  proptypesPath,
  dts_proptypes,
  ts.ScriptTarget.Latest
);
