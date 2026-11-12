import {
  InfiniteTable,
  DataSource,
  InfiniteTableApi,
  DataSourcePropMultiRowSelectionTarget,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumns,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: {
    renderSelectionCheckBox: true,
    defaultWidth: 70,
  },
  id: { field: 'id', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage === 'TypeScript';

export default function App() {
  const [target, setTarget] =
    React.useState<DataSourcePropMultiRowSelectionTarget>('visible');
  const [filtered, setFiltered] = React.useState(true);
  const [api, setApi] = React.useState<InfiniteTableApi<Developer> | null>(
    null,
  );
  const [selectedCount, setSelectedCount] = React.useState(0);

  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
          padding: 10,
          display: 'flex',
          gap: 20,
          alignItems: 'center',
        }}
      >
        <label>
          multiRowSelectionTarget:{' '}
          <select
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
            type="checkbox"
            checked={filtered}
            onChange={(e) => setFiltered(e.target.checked)}
          />{' '}
          Only show TypeScript developers
        </label>
        <button onClick={() => api?.rowSelectionApi.selectAll()}>
          Select all
        </button>
        <span>Selected rows (including filtered out): {selectedCount}</span>
      </div>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        selectionMode="multi-row"
        multiRowSelectionTarget={target}
        groupBy={groupBy}
        filterFunction={filtered ? filterFunction : undefined}
        onRowSelectionChange={(rowSelection) => {
          setSelectedCount(
            api?.rowSelectionApi.getSelectedPrimaryKeys(rowSelection).length ??
              0,
          );
        }}
      >
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={150}
          onReady={({ api }) => setApi(api)}
        />
      </DataSource>
    </>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
