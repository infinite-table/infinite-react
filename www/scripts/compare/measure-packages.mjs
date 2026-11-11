#!/usr/bin/env node
/**
 * Measures the install footprint and bundle size of Infinite Table and the
 * data grids we compare it with on /compare.
 *
 *   node www/scripts/compare/measure-packages.mjs            # all targets
 *   node www/scripts/compare/measure-packages.mjs ag-grid-community mui-x-data-grid
 *
 * For every target, in a fresh, empty temp folder:
 *
 * 1. `npm install <packages>` (latest versions, `--ignore-scripts`). npm also
 *    installs the required (non-optional) peer dependencies, exactly like it
 *    does for an app.
 * 2. Dependency count: walking the installed dependency graph (from the
 *    lockfile) from the grid's own packages - `dependencies`, installed
 *    `optionalDependencies` and required `peerDependencies` - and counting
 *    every distinct package reached, except the grid's own packages. The walk
 *    does not enter the framework (react, react-dom, vue), so the framework
 *    and its own dependencies are never counted.
 * 3. Bundle size: esbuild bundles a minimal "render one grid" entry (the
 *    getting-started imports for that grid, including its CSS), minified, for
 *    the browser, with the framework external and everything else bundled.
 *    Fonts and images referenced from CSS are not counted. We report the gzip
 *    size (level 9) of the JS and CSS output.
 *
 * Results are written to www/src/compare/package-stats.json, which the
 * comparison pages read. Commit the file after a run.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ESBUILD_VERSION = '0.25.10';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.resolve(
  __dirname,
  '../../src/compare/package-stats.json',
);

const FRAMEWORK_PACKAGES = new Set(['react', 'react-dom', 'vue']);

/**
 * Every distinct package reachable from `roots` in the npm lockfile, without
 * walking into the framework packages.
 */
function reachablePackages(lock, roots) {
  const entries = lock.packages;
  // node's resolution: <from>/node_modules/<name>, then each parent folder
  const resolve = (fromKey, name) => {
    let base = fromKey;
    for (;;) {
      const candidate = `${base ? `${base}/` : ''}node_modules/${name}`;
      if (entries[candidate]) {
        return candidate;
      }
      if (!base) {
        return null;
      }
      const idx = base.lastIndexOf('/node_modules/');
      base = idx === -1 ? '' : base.slice(0, idx);
    }
  };
  const seen = new Set();
  const found = new Map();
  const queue = roots.map((name) => resolve('', name)).filter(Boolean);
  while (queue.length) {
    const key = queue.shift();
    if (seen.has(key)) continue;
    seen.add(key);
    const info = entries[key];
    const name = info.name || key.split('node_modules/').pop();
    found.set(`${name}@${info.version}`, name);
    const optionalPeers = info.peerDependenciesMeta || {};
    const deps = [
      ...Object.keys(info.dependencies || {}),
      ...Object.keys(info.optionalDependencies || {}),
      ...Object.keys(info.peerDependencies || {}).filter(
        (dep) => !optionalPeers[dep]?.optional,
      ),
    ];
    for (const dep of deps) {
      if (FRAMEWORK_PACKAGES.has(dep)) continue;
      const depKey = resolve(key, dep);
      // optional dependencies for other platforms are not installed
      if (depKey) queue.push(depKey);
    }
  }
  return found;
}

/**
 * `packages`: what you install (the grid's own packages).
 * `extraInstall`: packages the getting-started guide tells you to install as
 *   well (themes, required peers that npm does not auto-install).
 * `entry`: the minimal usage that gets bundled.
 * `vendor`: package name prefixes of the vendor's own packages, used to split
 *   the dependencies into first-party and third-party ones.
 */
const TARGETS = [
  {
    id: 'infinite-react',
    label: 'Infinite Table (React)',
    framework: 'react',
    vendor: ['@infinite-table/'],
    packages: ['@infinite-table/infinite-react'],
    entry: `
import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import '@infinite-table/infinite-react/index.css';
const columns = { name: { field: 'name' } };
export const App = () => (
  <DataSource primaryKey="id" data={[{ id: 1, name: 'A' }]}>
    <InfiniteTable columns={columns} />
  </DataSource>
);`,
  },
  {
    id: 'infinite-vue',
    label: 'Infinite Table (Vue)',
    framework: 'vue',
    vendor: ['@infinite-table/'],
    packages: ['@infinite-table/infinite-vue'],
    entry: `
import { h } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import '@infinite-table/infinite-vue/index.css';
const columns = { name: { field: 'name' } };
export const App = () =>
  h(DataSource, { primaryKey: 'id', data: [{ id: 1, name: 'A' }] }, () =>
    h(InfiniteTable, { columns }),
  );`,
  },
  {
    id: 'ag-grid-community',
    label: 'AG Grid Community',
    framework: 'react',
    vendor: ['ag-'],
    packages: ['ag-grid-react', 'ag-grid-community'],
    entry: `
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
export const App = () => (
  <AgGridReact rowData={[{ name: 'A' }]} columnDefs={[{ field: 'name' }]} />
);`,
  },
  {
    id: 'ag-grid-enterprise',
    label: 'AG Grid Enterprise',
    framework: 'react',
    vendor: ['ag-'],
    packages: ['ag-grid-react', 'ag-grid-community', 'ag-grid-enterprise'],
    entry: `
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([AllEnterpriseModule]);
export const App = () => (
  <AgGridReact rowData={[{ name: 'A' }]} columnDefs={[{ field: 'name' }]} />
);`,
  },
  {
    id: 'mui-x-data-grid',
    label: 'MUI X Data Grid (Community)',
    framework: 'react',
    vendor: ['@mui/'],
    packages: ['@mui/x-data-grid'],
    extraInstall: ['@mui/material', '@emotion/react', '@emotion/styled'],
    entry: `
import { DataGrid } from '@mui/x-data-grid';
export const App = () => (
  <DataGrid rows={[{ id: 1, name: 'A' }]} columns={[{ field: 'name' }]} />
);`,
  },
  {
    id: 'mui-x-data-grid-premium',
    label: 'MUI X Data Grid Premium',
    framework: 'react',
    vendor: ['@mui/'],
    packages: ['@mui/x-data-grid-premium'],
    extraInstall: ['@mui/material', '@emotion/react', '@emotion/styled'],
    entry: `
import { DataGridPremium } from '@mui/x-data-grid-premium';
export const App = () => (
  <DataGridPremium rows={[{ id: 1, name: 'A' }]} columns={[{ field: 'name' }]} />
);`,
  },
  {
    id: 'tanstack-table',
    label: 'TanStack Table',
    framework: 'react',
    vendor: ['@tanstack/'],
    packages: ['@tanstack/react-table'],
    entry: `
import { useTable, tableFeatures, flexRender } from '@tanstack/react-table';
const features = tableFeatures({});
const columns = [{ accessorKey: 'name', header: 'Name' }];
export const App = () => {
  const table = useTable({ features, columns, data: [{ name: 'A' }] });
  return (
    <table>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};`,
  },
  {
    id: 'tanstack-table-virtual',
    label: 'TanStack Table + TanStack Virtual',
    framework: 'react',
    vendor: ['@tanstack/'],
    packages: ['@tanstack/react-table', '@tanstack/react-virtual'],
    entry: `
import { useRef } from 'react';
import { useTable, tableFeatures, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
const features = tableFeatures({});
const columns = [{ accessorKey: 'name', header: 'Name' }];
export const App = () => {
  const ref = useRef(null);
  const table = useTable({ features, columns, data: [{ name: 'A' }] });
  const rows = table.getRowModel().rows;
  const v = useVirtualizer({ count: rows.length, getScrollElement: () => ref.current, estimateSize: () => 32 });
  return (
    <div ref={ref} style={{ height: 400, overflow: 'auto' }}>
      {v.getVirtualItems().map((item) => (
        <div key={item.key}>
          {rows[item.index].getVisibleCells().map((cell) => (
            <span key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
          ))}
        </div>
      ))}
    </div>
  );
};`,
  },
  {
    id: 'handsontable',
    label: 'Handsontable',
    framework: 'react',
    vendor: ['@handsontable/', 'handsontable'],
    packages: ['@handsontable/react-wrapper', 'handsontable'],
    entry: `
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
registerAllModules();
export const App = () => (
  <HotTable themeName="ht-theme-main" data={[['A']]} colHeaders={['Name']} licenseKey="non-commercial-and-evaluation" />
);`,
  },
  {
    id: 'devextreme',
    label: 'DevExtreme React DataGrid',
    framework: 'react',
    vendor: ['devextreme', '@devextreme/'],
    packages: ['devextreme-react', 'devextreme'],
    entry: `
import DataGrid, { Column } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
export const App = () => (
  <DataGrid dataSource={[{ id: 1, name: 'A' }]} keyExpr="id">
    <Column dataField="name" />
  </DataGrid>
);`,
  },
  {
    id: 'syncfusion',
    label: 'Syncfusion React Grid',
    framework: 'react',
    packages: ['@syncfusion/ej2-react-grids'],
    // since v35 the themes ship in separate packages
    extraInstall: ['@syncfusion/ej2-material-theme'],
    vendor: ['@syncfusion/'],
    entry: `
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import '@syncfusion/ej2-material-theme/styles/grid/index.css';
export const App = () => (
  <GridComponent dataSource={[{ id: 1, name: 'A' }]}>
    <ColumnsDirective>
      <ColumnDirective field="name" headerText="Name" />
    </ColumnsDirective>
  </GridComponent>
);`,
  },
  {
    id: 'kendoreact',
    label: 'KendoReact Grid',
    framework: 'react',
    vendor: ['@progress/', '@telerik/'],
    packages: ['@progress/kendo-react-grid'],
    extraInstall: ['@progress/kendo-theme-default'],
    entry: `
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import '@progress/kendo-theme-default/dist/all.css';
export const App = () => (
  <Grid data={[{ id: 1, name: 'A' }]}>
    <GridColumn field="name" title="Name" />
  </Grid>
);`,
  },
  {
    id: 'glide-data-grid',
    label: 'Glide Data Grid',
    framework: 'react',
    vendor: ['@glideapps/'],
    packages: ['@glideapps/glide-data-grid'],
    entry: `
import { DataEditor, GridCellKind } from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';
const columns = [{ title: 'Name', id: 'name' }];
const getCellContent = () => ({ kind: GridCellKind.Text, data: 'A', displayData: 'A', allowOverlay: false });
export const App = () => <DataEditor columns={columns} rows={1} getCellContent={getCellContent} />;`,
  },
  {
    id: 'react-data-grid',
    label: 'react-data-grid',
    framework: 'react',
    vendor: ['react-data-grid'],
    packages: ['react-data-grid'],
    entry: `
import { DataGrid } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
export const App = () => (
  <DataGrid columns={[{ key: 'name', name: 'Name' }]} rows={[{ name: 'A' }]} />
);`,
  },
  {
    id: 'material-react-table',
    label: 'Material React Table',
    framework: 'react',
    vendor: ['material-react-table'],
    packages: ['material-react-table'],
    entry: `
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
const columns = [{ accessorKey: 'name', header: 'Name' }];
export const App = () => {
  const table = useMaterialReactTable({ columns, data: [{ name: 'A' }] });
  return <MaterialReactTable table={table} />;
};`,
  },
  {
    id: 'mantine-react-table',
    label: 'Mantine React Table',
    framework: 'react',
    vendor: ['mantine-react-table'],
    packages: ['mantine-react-table'],
    entry: `
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
const columns = [{ accessorKey: 'name', header: 'Name' }];
export const App = () => {
  const table = useMantineReactTable({ columns, data: [{ name: 'A' }] });
  return <MantineReactTable table={table} />;
};`,
  },
  {
    id: 'revogrid',
    label: 'RevoGrid',
    framework: 'react',
    vendor: ['@revolist/'],
    packages: ['@revolist/react-datagrid'],
    entry: `
import { RevoGrid } from '@revolist/react-datagrid';
export const App = () => (
  <RevoGrid columns={[{ prop: 'name', name: 'Name' }]} source={[{ name: 'A' }]} />
);`,
  },
  {
    id: 'wijmo',
    label: 'Wijmo FlexGrid',
    framework: 'react',
    vendor: ['@mescius/'],
    packages: ['@mescius/wijmo.react.grid'],
    extraInstall: ['@mescius/wijmo.styles'],
    entry: `
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import '@mescius/wijmo.styles/wijmo.css';
export const App = () => (
  <FlexGrid itemsSource={[{ id: 1, name: 'A' }]}>
    <FlexGridColumn binding="name" header="Name" />
  </FlexGrid>
);`,
  },
];

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

const npmInstall = (cwd, pkgs) =>
  run(
    'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', ...pkgs],
    cwd,
  );

function setupTools(root) {
  const toolsDir = path.join(root, 'tools');
  fs.mkdirSync(toolsDir, { recursive: true });
  fs.writeFileSync(
    path.join(toolsDir, 'package.json'),
    JSON.stringify({ name: 'tools', private: true }),
  );
  if (!fs.existsSync(path.join(toolsDir, 'node_modules', 'esbuild'))) {
    npmInstall(toolsDir, [`esbuild@${ESBUILD_VERSION}`]);
  }
  // the esbuild JS API finds its platform binary through the optional dependency
  return path.join(toolsDir, 'node_modules', 'esbuild', 'lib', 'main.js');
}

const gzipSize = (buf) => zlib.gzipSync(buf, { level: 9 }).length;

function sizes(file) {
  if (!fs.existsSync(file)) {
    return null;
  }
  const buf = fs.readFileSync(file);
  return { minified: buf.length, gzip: gzipSize(buf) };
}

async function measure(target, root, esbuildPath) {
  const dir = path.join(root, target.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: `measure-${target.id}`, private: true }),
  );

  // MEASURE_DIR=<folder of an earlier run> reuses its installs
  if (!fs.existsSync(path.join(dir, 'package-lock.json'))) {
    npmInstall(dir, [...target.packages, ...(target.extraInstall || [])]);
  }

  const lock = JSON.parse(
    fs.readFileSync(path.join(dir, 'package-lock.json'), 'utf8'),
  );
  const own = new Set(target.packages);
  const reachable = reachablePackages(lock, [
    ...target.packages,
    ...(target.extraInstall || []),
  ]);

  const packages = target.packages.map((name) => {
    const pkgJson = JSON.parse(
      fs.readFileSync(
        path.join(dir, 'node_modules', name, 'package.json'),
        'utf8',
      ),
    );
    return {
      name,
      version: pkgJson.version,
      dependencies: Object.keys(pkgJson.dependencies || {}).filter(
        (dep) => !own.has(dep),
      ),
      peerDependencies: Object.keys(pkgJson.peerDependencies || {}),
    };
  });

  const transitive = [...reachable.entries()]
    .filter(([, name]) => !own.has(name))
    .map(([id]) => id)
    .sort();
  const vendor = target.vendor || [];
  const isFirstParty = (id) => {
    const name = id.slice(0, id.lastIndexOf('@'));
    return vendor.some((prefix) => name.startsWith(prefix));
  };

  const extraInstall = (target.extraInstall || []).map((name) => {
    const pkgJson = JSON.parse(
      fs.readFileSync(
        path.join(dir, 'node_modules', name, 'package.json'),
        'utf8',
      ),
    );
    return `${name}@${pkgJson.version}`;
  });

  fs.writeFileSync(path.join(dir, 'entry.jsx'), target.entry);
  const { build } = await import(esbuildPath);
  const external =
    target.framework === 'vue'
      ? ['vue']
      : ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'];
  const outdir = path.join(dir, 'out');
  await build({
    absWorkingDir: dir,
    entryPoints: ['entry.jsx'],
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    external,
    outdir,
    logLevel: 'error',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: {
      '.woff': 'empty',
      '.woff2': 'empty',
      '.ttf': 'empty',
      '.eot': 'empty',
      '.svg': 'empty',
      '.png': 'empty',
      '.gif': 'empty',
      '.jpg': 'empty',
    },
  });

  const js = sizes(path.join(outdir, 'entry.js'));
  const css = sizes(path.join(outdir, 'entry.css'));

  return {
    label: target.label,
    measuredAt: new Date().toISOString().slice(0, 10),
    framework: target.framework,
    packages: packages.map(({ name, version }) => ({ name, version })),
    directDependencies: [
      ...new Set(packages.flatMap((p) => p.dependencies)),
    ].sort(),
    peerDependencies: [
      ...new Set(packages.flatMap((p) => p.peerDependencies)),
    ]
      .filter((name) => !own.has(name))
      .sort(),
    extraInstall,
    transitiveDependencyCount: transitive.length,
    firstPartyDependencyCount: transitive.filter(isFirstParty).length,
    thirdPartyDependencyCount: transitive.filter((id) => !isFirstParty(id))
      .length,
    transitiveDependencies: transitive,
    bundle: {
      jsGzip: js?.gzip ?? 0,
      jsMinified: js?.minified ?? 0,
      cssGzip: css?.gzip ?? 0,
      cssMinified: css?.minified ?? 0,
    },
  };
}

async function main() {
  const only = process.argv.slice(2);
  const targets = only.length
    ? TARGETS.filter((t) => only.includes(t.id))
    : TARGETS;

  const root =
    process.env.MEASURE_DIR ||
    fs.mkdtempSync(path.join(os.tmpdir(), 'compare-measure-'));
  console.log(`Working in ${root}`);
  const esbuildPath = setupTools(root);

  const previous = fs.existsSync(OUTPUT_FILE)
    ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'))
    : { results: {} };

  const results = { ...previous.results };
  const failures = [];

  for (const target of targets) {
    process.stdout.write(`- ${target.id} ... `);
    try {
      results[target.id] = await measure(target, root, esbuildPath);
      const r = results[target.id];
      console.log(
        `${r.transitiveDependencyCount} deps (${r.thirdPartyDependencyCount} third-party), js ${(r.bundle.jsGzip / 1024).toFixed(1)} kB gz, css ${(r.bundle.cssGzip / 1024).toFixed(1)} kB gz`,
      );
    } catch (err) {
      const message = String(err.stderr || err.message || err).slice(0, 2000);
      console.log('FAILED');
      console.log(message);
      failures.push(target.id);
    }
  }

  const output = {
    measuredAt: new Date().toISOString().slice(0, 10),
    tools: {
      node: process.version,
      npm: run('npm', ['--version'], root).trim(),
      esbuild: ESBUILD_VERSION,
    },
    script: 'www/scripts/compare/measure-packages.mjs',
    results: Object.fromEntries(
      TARGETS.filter((t) => results[t.id]).map((t) => [t.id, results[t.id]]),
    ),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nWrote ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  if (failures.length) {
    console.log(`Failed: ${failures.join(', ')}`);
    process.exitCode = 1;
  }
}

main();
