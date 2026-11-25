import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropMultiRowSelectionTarget,
  DataSourcePropRowSelection,
  DataSourcePropRowSelection_MultiRow,
  InfiniteTableApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

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

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="
        color: var(--infinite-cell-color);
        padding: 10px;
        display: flex;
        gap: 20px;
        align-items: center;
      "
    >
      <label>
        multiRowSelectionTarget:
        <select [value]="target()" (change)="onTargetChange($event)">
          <option value="all">all</option>
          <option value="visible">visible</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          [checked]="filtered()"
          (change)="filtered.set($any($event.target).checked)"
        />
        Only show TypeScript developers
      </label>
      <button (click)="api?.rowSelectionApi?.selectAll()">Select all</button>
      <span>Selected rows (including filtered out): {{ selectedCount() }}</span>
    </div>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      selectionMode="multi-row"
      [multiRowSelectionTarget]="target()"
      [groupBy]="groupBy"
      [filterFunction]="filtered() ? filterFunction : undefined"
      (rowSelectionChange)="onRowSelectionChange($event)"
    >
      <infinite-table
        [columns]="columns"
        [columnDefaultWidth]="150"
        (ready)="api = $event.api"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly filterFunction = filterFunction;

  protected readonly target =
    signal<DataSourcePropMultiRowSelectionTarget>('visible');
  protected readonly filtered = signal(true);
  protected readonly selectedCount = signal(0);

  protected api: InfiniteTableApi<Developer> | null = null;

  protected onTargetChange(event: Event) {
    this.target.set(
      (event.target as HTMLSelectElement)
        .value as DataSourcePropMultiRowSelectionTarget,
    );
  }

  protected onRowSelectionChange(
    rowSelection: DataSourcePropRowSelection | undefined,
  ) {
    // selectionMode="multi-row": the selection is an object
    this.selectedCount.set(
      this.api?.rowSelectionApi.getSelectedPrimaryKeys(
        rowSelection as DataSourcePropRowSelection_MultiRow,
      ).length ?? 0,
    );
  }
}
