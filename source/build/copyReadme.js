/**
 * Copies the repo's README into the package being built
 * ($INFINITE_OUT_FOLDER). The README is written for the React package;
 * for the Vue package the hero banner, the framework name, the package
 * name and the docs links are swapped for the Vue ones, and the lines that
 * only apply to React are dropped.
 */
const fs = require('fs');
const path = require('path');

/** [from, to] pairs. Each `from` has to be in the README, so a README edit that drops one fails the build. */
const VUE_REPLACEMENTS = [
  [
    'alt="The React DataGrid built for speed"',
    'alt="The Vue DataGrid built for speed"',
  ],
  ['/hero/readme-banner-react.png', '/hero/readme-banner-vue.png'],
  ['for building React apps', 'for building Vue apps'],
  ['is a React DataGrid component', 'is a Vue DataGrid component'],
  [
    "Choosing a React DataGrid is a big decision. We've put together honest comparisons so you can see where Infinite Table fits — particularly if you value a component that feels native to React (hooks, controlled/uncontrolled props).",
    "Choosing a DataGrid is a big decision. We've put together honest comparisons so you can see where Infinite Table fits.",
  ],
  // MUI X Data Grid has no Vue version
  [
    '- [vs MUI X Data Grid](https://infinite-table.com/compare/mui-x-data-grid)\n',
    '',
  ],
  // the benchmark page measures the React grids; the Vue ones have their own benchmark
  [
    '[Benchmark: Infinite Table vs MUI X Data Grid, AG Grid and TanStack Table at 300k and 1M rows](https://infinite-table.com/benchmark)',
    '[Benchmark: Infinite Table vs TanStack Table, AG Grid, PrimeVue DataTable and Element Plus Table V2 at 300k and 1M rows](https://github.com/infinite-table/vue-datagrid-performance-comparison)',
  ],
  ['@infinite-table/infinite-react', '@infinite-table/infinite-vue'],
  // the Vue docs and the Vue home page
  ['https://infinite-table.com/docs', 'https://infinite-table.com/vue/docs'],
  ['href="https://infinite-table.com"', 'href="https://infinite-table.com/vue"'],
];

/**
 * Angular: until the Angular docs and home page are live, the docs links
 * stay on the React docs and the banner is the React one; only the framework
 * wording and the package name change.
 */
const ANGULAR_REPLACEMENTS = [
  [
    'alt="The React DataGrid built for speed"',
    'alt="The Angular DataGrid built for speed"',
  ],
  ['for building React apps', 'for building Angular apps'],
  ['is a React DataGrid component', 'is an Angular DataGrid component'],
  [
    "Choosing a React DataGrid is a big decision. We've put together honest comparisons so you can see where Infinite Table fits — particularly if you value a component that feels native to React (hooks, controlled/uncontrolled props).",
    "Choosing a DataGrid is a big decision. We've put together honest comparisons so you can see where Infinite Table fits.",
  ],
  // MUI X Data Grid has no Angular version
  [
    '- [vs MUI X Data Grid](https://infinite-table.com/compare/mui-x-data-grid)\n',
    '',
  ],
  // the benchmark page measures the React grids; there is no Angular run yet
  [
    '- [Benchmark: Infinite Table vs MUI X Data Grid, AG Grid and TanStack Table at 300k and 1M rows](https://infinite-table.com/benchmark)\n',
    '',
  ],
  ['@infinite-table/infinite-react', '@infinite-table/infinite-angular'],
];

const outFolder = process.env.INFINITE_OUT_FOLDER;
if (!outFolder) {
  throw new Error('copyReadme: INFINITE_OUT_FOLDER is not set');
}

const framework =
  path.basename(outFolder) === 'dist-vue'
    ? 'vue'
    : path.basename(outFolder) === 'dist-angular'
    ? 'angular'
    : 'react';
let readme = fs.readFileSync(
  path.resolve(__dirname, '../../README.md'),
  'utf8',
);

const REPLACEMENTS = {
  vue: VUE_REPLACEMENTS,
  angular: ANGULAR_REPLACEMENTS,
  react: [],
};

{
  for (const [from, to] of REPLACEMENTS[framework]) {
    if (!readme.includes(from)) {
      throw new Error(`copyReadme: the README does not contain: ${from}`);
    }
    readme = readme.split(from).join(to);
  }
}

fs.writeFileSync(path.resolve(__dirname, '..', outFolder, 'README.md'), readme);
