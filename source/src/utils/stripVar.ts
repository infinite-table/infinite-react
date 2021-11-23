export function stripVar(cssVariableWithVarString: string) {
  return cssVariableWithVarString.slice(4, -1);
}
