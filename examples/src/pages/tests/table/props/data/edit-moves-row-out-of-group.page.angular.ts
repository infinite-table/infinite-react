import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

// see edit-moves-row-out-of-group.page.tsx for the description of this test page

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

const onEditPersistSuccess = ({
  rowInfo,
  value,
}: {
  rowInfo: any;
  value: unknown;
}) => {
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

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id" [groupBy]="groupBy">
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [columnDefaultWidth]="150"
        (editPersistSuccess)="onEditPersistSuccess($event)"
      />
    </infinite-data-source>
  `,
})
export default class EditMovesRowOutOfGroupPage {
  protected readonly data = data;
  protected readonly onEditPersistSuccess = onEditPersistSuccess;
  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    firstName: { field: 'firstName' },
    stack: { field: 'stack', defaultEditable: true },
  };
  protected readonly groupBy = [{ field: 'stack' as const }];
  protected readonly domProps = {
    style: { height: '100%' },
  };
}
