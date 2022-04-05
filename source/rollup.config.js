import dts from 'rollup-plugin-dts';
const config = [
  {
    input: './dist/index.d.ts',
    external: () => false,
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      dts({
        respectExternal: false,
      }),
    ],
  },
];

export default config;
