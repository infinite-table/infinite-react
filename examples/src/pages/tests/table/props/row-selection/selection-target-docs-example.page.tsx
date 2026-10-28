import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropMultiRowSelectionTarget,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumns,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';

import { data, height80vhDomProps, type Developer } from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage === 'TypeScript';

const dataSource = () =>
  new Promise<Developer[]>((resolve) => setTimeout(() => resolve(data), 20));

export default function App() {
  const [target, setTarget] =
    React.useState<DataSourcePropMultiRowSelectionTarget>('visible');
  const [filtered, setFiltered] = React.useState(true);

  return (
    <>
      <div style={{ padding: 10, display: 'flex', gap: 20, color: 'tomato' }}>
        <label>
          multiRowSelectionTarget:{' '}
          <select
            data-name="target"
            value={target}
            onChange={(e) =>
              setTarget(e.target.value as DataSourcePropMultiRowSelectionTarget)
            }
          >
            <option value="all">all</option>
            <option value="visible">visible</option>
          </select>
        </label>
        <label>
          <input
            data-name="only-typescript"
            type="checkbox"
            checked={filtered}
            onChange={(e) => setFiltered(e.target.checked)}
          />{' '}
          Only show TypeScript developers
        </label>
      </div>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        selectionMode="multi-row"
        multiRowSelectionTarget={target}
        groupBy={groupBy}
        filterFunction={filtered ? filterFunction : undefined}
      >
        <InfiniteTable<Developer>
          domProps={height80vhDomProps}
          columns={columns}
        />
      </DataSource>
    </>
  );
}
