const textReplace = require("esbuild-plugin-text-replace");

// TODO use a command line helper for this
const format = process.argv[2];
const watch = process.argv[3] === "--watch";

if (!format || !(format in { esm: true, cjs: true })) {
  throw "Invalid format supplied";
}

require("esbuild")
  .build({
    entryPoints: ["./build/ts-compiler/compile.ts"],
    tsconfig: "./build/ts-compiler/tscompilerconfig.json",
    bundle: true,
    // minify: true,
    // minifyWhitespace: true,
    define: {
      "process.env.TS_ETW_MODULE_PATH": null,
    },
    plugins: [
      textReplace({
        include: /typescript/,
        pattern: [
          [
            "function createCompilerHostWorker(options, setParentNodes, system)",
            "function createCompilerHostWorker(options, setParentNodes, system = {})",
          ],
        ],
      }),
    ],
    watch: watch
      ? {
          onRebuild(error, result) {
            if (error) console.error("watch build failed:", error);
            else console.log("watch build succeeded:", result);
          },
        }
      : null,
    format: format,
    bundle: true,
    external: ["os", "path", "fs", "perf_hooks"],
    platform: "browser",

    outfile: `./src/ts-compiler-bundle-large${
      format === "esm" ? ".esm" : ""
    }.js`,
  })
  .catch(() => process.exit(1));
