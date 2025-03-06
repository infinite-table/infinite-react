import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';

import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

async function processCss(css) {
  const result = await postcss([autoprefixer]).process(css, {
    from: undefined /* suppress source map warning */,
  });

  return result.css;
}

export const vanillaConfig = vanillaExtractPlugin({
  processCss,
  identifiers: 'short',
});
