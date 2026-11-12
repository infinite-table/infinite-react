import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Italy', age: 30 },
  { id: 2, firstName: 'Bob', country: 'Italy', age: 40 },
  { id: 3, firstName: 'Cid', country: 'France', age: 35 },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', type: 'number', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
};

const columnPinning = { id: 'start' } as const;

const domProps = {
  style: {
    height: '100%',
  },
};

const THEMES = ['ocean', 'balsam', 'minimalist'] as const;
const MODES = ['light', 'dark'] as const;

/**
 * Every grid has its mode set with a className (on a parent of the element
 * that has the theme className), so the color scheme of the OS should not
 * matter for any of them.
 */
export default function App() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {THEMES.map((theme) =>
        MODES.map((mode) => (
          <div
            key={`${theme}-${mode}`}
            className={`infinite-theme-mode--${mode}`}
          >
            <div
              data-name={`${theme}-${mode}`}
              className={`infinite-theme-name--${theme}`}
              style={{ height: 220 }}
            >
              <DataSource<Developer>
                primaryKey="id"
                data={data}
                defaultFilterValue={[]}
              >
                <InfiniteTable<Developer>
                  domProps={domProps}
                  columns={columns}
                  columnDefaultWidth={120}
                  defaultColumnPinning={columnPinning}
                  defaultActiveCellIndex={[1, 1]}
                />
              </DataSource>
            </div>
          </div>
        )),
      )}
    </div>
  );
}
