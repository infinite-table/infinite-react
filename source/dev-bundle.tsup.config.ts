import { defineConfig } from 'tsup';

import { tsupConfig } from './tsup.config';

tsupConfig.minify = false;
tsupConfig.clean = true;
tsupConfig.outExtension = ({ format }) => {
  return {
    js: format === 'cjs' ? '.dev.js' : '.dev.mjs',
  };
};
export default defineConfig(tsupConfig);
