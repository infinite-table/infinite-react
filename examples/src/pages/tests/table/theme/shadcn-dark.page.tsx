import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

import { removeInfiniteDarkModeFromBody, shadcnVarsCSS } from './shadcnVars';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Italy', stack: 'frontend', age: 30 },
  { id: 2, firstName: 'Bob', country: 'Italy', stack: 'backend', age: 40 },
  { id: 3, firstName: 'Cid', country: 'France', stack: 'frontend', age: 35 },
  { id: 4, firstName: 'Dan', country: 'France', stack: 'backend', age: 50 },
  { id: 5, firstName: 'Eve', country: 'Spain', stack: 'fullstack', age: 28 },
  { id: 6, firstName: 'Fay', country: 'Spain', stack: 'backend', age: 45 },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', type: 'number', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  stack: { field: 'stack' },
  age: { field: 'age', type: 'number' },
};

const columnPinning = { id: 'start' } as const;

const rowDisabledState = {
  enabledRows: true,
  disabledRows: [2, 3],
} as const;

const domProps = {
  style: {
    height: '100%',
  },
};

function Grid() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      defaultFilterValue={[]}
      defaultRowDisabledState={rowDisabledState}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={140}
        defaultColumnPinning={columnPinning}
        defaultActiveRowIndex={0}
        keyboardNavigation="row"
      />
    </DataSource>
  );
}

const sectionStyle = {
  flex: 1,
  padding: 10,
  background: 'var(--background)',
  color: 'var(--foreground)',
};

/**
 * The shadcn theme takes its colors from the shadcn/ui CSS variables of the
 * page, which are in dark mode under the `dark` className.
 *
 * No `infinite-theme-mode--*` className is used here.
 */
export default function App() {
  const [ready, setReady] = React.useState(false);

  React.useLayoutEffect(() => {
    const restore = removeInfiniteDarkModeFromBody();
    setReady(true);

    return restore;
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <div style={{ display: 'flex', height: '80vh' }}>
      <style>{shadcnVarsCSS}</style>
      <div
        data-name="light"
        style={sectionStyle}
        className="infinite-theme-name--shadcn"
      >
        <Grid />
      </div>
      <div
        data-name="dark"
        style={sectionStyle}
        className="dark infinite-theme-name--shadcn"
      >
        <Grid />
      </div>
    </div>
  );
}
