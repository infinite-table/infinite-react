import dts from "rollup-plugin-dts";

const config = [
  {
    input: "./index.d.ts",
    // external: () => false,
    external: [],
    output: [{ file: "dist.d.ts", format: "es" }],
    plugins: [
      dts({
        respectExternal: false,
      }),
    ],
  },
];

export default config;
