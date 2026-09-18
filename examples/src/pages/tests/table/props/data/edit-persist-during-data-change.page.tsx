import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';

/**
 * `api.persistEdit` awaits a frame before it reads the edited row, so a data
 * change landing in that window shifts the row's index under it. Here
 * `onEditAccepted` — which fires right before `persistEdit` is invoked —
 * removes Mark, the only backend row: the backend group disappears and Dana
 * (the row being edited) moves from index 7 to index 5. The edit must still
 * be persisted on Dana, found by primary key.
 *
 * Rows: 0 frontend group, 1-3 leaves, 4 backend group, 5 Mark, 6 devops group, 7 Dana
 */
type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', stack: 'frontend' },
  { id: 2, firstName: 'Marry', stack: 'frontend' },
  { id: 3, firstName: 'Bill', stack: 'frontend' },
  { id: 4, firstName: 'Mark', stack: 'backend' },
  { id: 5, firstName: 'Dana', stack: 'devops' },
];

type PersistedEdit = {
  id: number;
  firstName: string;
  rowIndex: number;
  value: unknown;
};

(globalThis as any).persistedEdits = [] as PersistedEdit[];

const onEditAccepted: InfiniteTableProps<Developer>['onEditAccepted'] = ({
  dataSourceApi,
}) => {
  dataSourceApi.removeDataByPrimaryKey(4);
};

const onEditPersistSuccess: InfiniteTableProps<Developer>['onEditPersistSuccess'] =
  ({ rowInfo, value }) => {
    if (rowInfo.isGroupRow) {
      return;
    }
    (globalThis as any).persistedEdits.push({
      id: rowInfo.data.id,
      firstName: rowInfo.data.firstName,
      rowIndex: rowInfo.indexInAll,
      value,
    } satisfies PersistedEdit);
  };

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  firstName: { field: 'firstName', defaultEditable: true },
  stack: { field: 'stack' },
};

export default () => {
  return (
    <React.StrictMode>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        groupBy={[{ field: 'stack' }]}
      >
        <InfiniteTable<Developer>
          domProps={{ style: { height: '100%' } }}
          columns={columns}
          columnDefaultWidth={150}
          onEditAccepted={onEditAccepted}
          onEditPersistSuccess={onEditPersistSuccess}
        />
      </DataSource>
    </React.StrictMode>
  );
};
