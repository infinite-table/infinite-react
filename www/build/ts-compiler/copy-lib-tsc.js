const fs = require("fs");
const path = require("path");

let dts = fs.readFileSync(
  path.resolve(__dirname, "../../../source/dist/index.d.ts"),
  "utf-8"
);

dts = dts.replace(
  /declare module \"index\"/g,
  'declare module "@infinite-table/infinite-react"'
);
const content = "export const dts = `" + dts + "`";
fs.writeFileSync(path.resolve(__dirname, "lib-extra.ts"), content, "utf-8");
