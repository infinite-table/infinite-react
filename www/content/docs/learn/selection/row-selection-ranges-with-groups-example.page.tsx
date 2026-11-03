import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  InfiniteTableApi,
  InfiniteTablePropMultiRowSelectionWith,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumns,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  name: string;
  language: string;
};

const data: Developer[] = [
  { id: 1, name: 'TS 1', language: 'TypeScript' },
  { id: 2, name: 'TS 2', language: 'TypeScript' },
  { id: 3, name: 'TS 3', language: 'TypeScript' },
  { id: 4, name: 'Go 1', language: 'Go' },
  { id: 5, name: 'Go 2', language: 'Go' },
  { id: 6, name: 'Rust 1', language: 'Rust' },
  { id: 7, name: 'Rust 2', language: 'Rust' },
  { id: 8, name: 'Rust 3', language: 'Rust' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  name: { field: 'name' },
  language: { field: 'language' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'language' }];

// the Go group starts collapsed
const defaultGroupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [['Go']],
});

export default function App() {
  const [selectWith, setSelectWith] =
    React.useState<InfiniteTablePropMultiRowSelectionWith>('click');
  const [api, setApi] = React.useState<InfiniteTableApi<Developer> | null>(
    null,
  );
  const [selected, setSelected] = React.useState<string[]>([]);

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
          multiRowSelectionWith:{' '}
          <select
            value={selectWith}
            onChange={(e) =>
              setSelectWith(
                e.target.value as InfiniteTablePropMultiRowSelectionWith,
              )
            }
          >
            <option value="click">click</option>
            <option value="checkbox">checkbox</option>
          </select>
        </label>
        <span>Selected: {selected.join(', ') || 'none'}</span>
      </div>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        selectionMode="multi-row"
        groupBy={groupBy}
        defaultGroupRowsState={defaultGroupRowsState}
        onRowSelectionChange={(rowSelection) => {
          const ids = api?.rowSelectionApi.getSelectedPrimaryKeys(rowSelection);
          setSelected(
            data.filter((d) => ids?.includes(d.id)).map((d) => d.name),
          );
        }}
      >
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={150}
          groupRenderStrategy="single-column"
          multiRowSelectionWith={selectWith}
          onReady={({ api }) => setApi(api)}
        />
      </DataSource>
    </>
  );
}
