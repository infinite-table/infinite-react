import { defineConfig, Options } from 'tsup';

// @ts-ignore
import packageJSON from './package.json';

import fs from 'fs';

import { vanillaConfig } from './tsup-vanilla-extract-config';

const { config } = packageJSON;
const outDir = config.outdir + '/theme/';

export const tsupConfig: Options = {
  entry: {
    balsam: './src/generate-theme-balsam.ts',
    default: './src/generate-theme-default.ts',
    minimalist: './src/generate-theme-minimalist.ts',
    ocean: './src/generate-theme-ocean.ts',
    shadcn: './src/generate-theme-shadcn.ts',
  },

  tsconfig: './tsconfig.build.json',
  outDir,
  bundle: true,
  clean: false,

  onSuccess: async () => {
    // remove all non-css files from the theme folder
    fs.readdirSync(outDir).forEach((file) => {
      if (!file.endsWith('.css')) {
        fs.unlinkSync(outDir + '/' + file);
      } else {
        console.log('Generated ' + file);
      }
    });

    console.log('Files generated in ' + outDir + ' folder');
  },

  esbuildPlugins: [vanillaConfig],
};

export default defineConfig(tsupConfig);
