const watch = process.argv[2] === "--watch";

require("esbuild")
  .build({
    entryPoints: ["functions/json-server/fn.js"],
    bundle: true,
    watch: watch
      ? {
          onRebuild(error, result) {
            if (error) console.error("watch build failed:", error);
            else console.log("watch build succeeded:", result);
          },
        }
      : null,
    external: [
      "express",
      "serverless-http",
      "path",
      "body-parser",
      "json-server",
    ],
    format: "cjs",
    target: "es2016",
    platform: "node",
    outfile: `functions/json-server/json-server.js`,
  })
  .catch(() => process.exit(1));
