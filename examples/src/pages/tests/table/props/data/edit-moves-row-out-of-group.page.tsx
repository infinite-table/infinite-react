import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';

/**
 * Editing a value the grid is grouped by moves the row to another group.
 * When the row was alone in its group, the group disappears and the row
 * count shrinks — the edited row's index no longer exists, so the edit
 * callbacks must find the row by primary key rather than by index.
 *
 * Rows: 0 frontend group, 1-3 leaves, 4 backend group, 5 leaf, 6 devops group, 7 leaf (Dana, alone)
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
  stack: string;
  rowIndex: number;
  value: unknown;
};

(globalThis as any).persistedEdits = [] as PersistedEdit[];

const onEditPersistSuccess: InfiniteTableProps<Developer>['onEditPersistSuccess'] =
  ({ rowInfo, value }) => {
    if (rowInfo.isGroupRow) {
      return;
    }
    (globalThis as any).persistedEdits.push({
      id: rowInfo.data.id,
      stack: rowInfo.data.stack,
      rowIndex: rowInfo.indexInAll,
      value,
    } satisfies PersistedEdit);
  };

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  stack: { field: 'stack', defaultEditable: true },
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
          onEditPersistSuccess={onEditPersistSuccess}
        />
      </DataSource>
    </React.StrictMode>
  );
};
