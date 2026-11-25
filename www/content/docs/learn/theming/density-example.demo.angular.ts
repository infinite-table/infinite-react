import { Component, signal } from '@angular/core';

import {
  DataSource,
  GroupRowsState,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-angular';

import { columns } from './columns.angular';
import type { Employee } from './columns.angular';

type Density = 'compact' | 'comfortable' | 'spacious';

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

const groupBy: DataSourcePropGroupBy<Employee> = [{ field: 'department' }];

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100').then((r) =>
    r.json(),
  );
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #highlight the density class, on a parent element of the grid -->
    <div
      [class]="'infinite-density--' + density()"
      style="display: flex; flex-flow: column; flex: 1; color: var(--infinite-cell-color); background: var(--infinite-background)"
    >
      <div
        style="display: flex; flex-flow: row; align-items: center; gap: 10px; padding: 10px"
      >
        Density
        <select
          title="Select density"
          [value]="density()"
          (change)="setDensity($event)"
        >
          <option value="compact">compact</option>
          <option value="comfortable">comfortable</option>
          <option value="spacious">spacious</option>
        </select>
      </div>
      <infinite-data-source
        [data]="dataSource"
        primaryKey="id"
        [groupBy]="groupBy"
        [defaultGroupRowsState]="groupRowsState"
      >
        <!-- no rowHeight specified, so the density drives it -->
        <infinite-table debugId="density-example" [columns]="columns" />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly groupRowsState = groupRowsState;

  protected readonly density = signal<Density>('compact');

  protected setDensity(event: Event) {
    this.density.set((event.target as HTMLSelectElement).value as Density);
  }
}
