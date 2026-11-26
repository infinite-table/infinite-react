import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropRowSelection,
  DataSourcePropSortInfo,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Task = {
  id: number;
  title: string;
  status: string;
  owner: string;
  estimate: number;
};

const STATUSES = ['Backlog', 'In progress', 'Done'];
const OWNERS = ['Ana', 'Ben', 'Chloe', 'Dan'];

const data: Task[] = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  title: `Task ${i + 1}`,
  status: STATUSES[i % STATUSES.length],
  owner: OWNERS[i % OWNERS.length],
  estimate: ((i * 3) % 8) + 1,
}));

const columns: InfiniteTablePropColumns<Task> = {
  title: { field: 'title', header: 'Title', defaultFlex: 1 },
  owner: { field: 'owner', header: 'Owner' },
  estimate: { field: 'estimate', header: 'Estimate', type: 'number' },
};

const groupBy: DataSourcePropGroupBy<Task> = [{ field: 'status' }];
const defaultRowSelection: DataSourcePropRowSelection = {
  selectedRows: [1, 4],
  defaultSelection: false,
};
const defaultSortInfo: DataSourcePropSortInfo<Task> = [
  { field: 'estimate', dir: -1 },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div class="infinite-theme-name--paper" style="display: flex; flex: 1">
      <infinite-data-source
        [data]="data"
        primaryKey="id"
        [groupBy]="groupBy"
        selectionMode="multi-row"
        [defaultRowSelection]="defaultRowSelection"
        [defaultSortInfo]="defaultSortInfo"
      >
        <infinite-table [columns]="columns" />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly defaultRowSelection = defaultRowSelection;
  protected readonly defaultSortInfo = defaultSortInfo;
}
