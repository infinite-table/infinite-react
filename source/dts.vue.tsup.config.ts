import { defineConfig } from 'tsup';

/**
 * Generates the dts file for the Vue package (dist-vue/index.d.ts).
 * Counterpart of dts.tsup.config.ts - uses the Vue entry and tsconfig.vue.json
 * so `./Foo` resolves Foo.vue.tsx/.vue.ts siblings (moduleSuffixes).
 */

const OUT_DIR = 'dist-vue';

export default defineConfig({
  // named `index` so the output matches the typings field (index.d.ts)
  // of the generated dist-vue/package.json
  entry: { index: './src/index.vue.tsx' },
  dts: true,
  tsconfig: './tsconfig.vue.json',
  outDir: OUT_DIR,
  splitting: false,
  sourcemap: false,
  // dist-vue already contains the js/css output of the esbuild:vue step
  clean: false,
  onSuccess: async () => {
    console.log('dts file updated in ' + OUT_DIR + '/index.d.ts');
  },
});
