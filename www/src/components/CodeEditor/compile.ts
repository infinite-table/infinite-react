const { compileProgram } = require("../../ts-compiler-bundle-large");

const compile = compileProgram;
export { compile };

//@ts-ignore
globalThis.compile = compileProgram;
