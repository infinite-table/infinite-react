import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  InfiniteTableGroupColumnFunction,
  InfiniteTablePropGroupRenderStrategy,
} from '@infinite-table/infinite-angular';

import { columns } from './employee-columns.angular';
import type { Employee } from './employee-columns.angular';

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'age',
  },
  {
    field: 'companyName',
  },
];

const groupColumn: InfiniteTableGroupColumnFunction<Employee> = (options) => {
  const field = options.groupByForColumn?.field;
  const groupColumn = {
    width: field === 'age' ? 160 : 250,
    header: field === 'age' ? '🎊 Age' : '🎉 Company',
    renderValue: ({ value }: { value: any }) => {
      if (field === 'age') {
        return `Age: ${value}`;
      }

      return value;
    },
  };

  return groupColumn;
};

const domProps = {
  style: { flex: 1 },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees1k')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="
        display: flex;
        flex: 1;
        color: var(--infinite-cell-color);
        flex-flow: column;
        background: var(--infinite-background);
      "
    >
      <p style="padding: 10px">Please select the group render strategy</p>
      <div style="padding: 10px">
        <select
          style="
            margin: 10px 0;
            display: inline-block;
            background: var(--infinite-background);
            color: currentColor;
            padding: var(--infinite-space-3);
          "
          [value]="groupRenderStrategy()"
          (change)="onStrategyChange($event)"
        >
          <option value="multi-column">multi-column</option>
          <option value="single-column">single-column</option>
        </select>
      </div>
      <infinite-data-source
        [data]="dataSource"
        primaryKey="id"
        [groupBy]="groupBy"
      >
        <infinite-table
          debugId="groupRenderStrategy-example"
          [domProps]="domProps"
          [groupRenderStrategy]="groupRenderStrategy()"
          [groupColumn]="groupColumn"
          [columns]="columns"
          [columnDefaultWidth]="150"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly groupColumn = groupColumn;
  protected readonly domProps = domProps;

  protected readonly groupRenderStrategy =
    signal<InfiniteTablePropGroupRenderStrategy>('multi-column');

  protected onStrategyChange(event: Event) {
    const groupRenderStrategy = (event.target as HTMLSelectElement)
      .value as InfiniteTablePropGroupRenderStrategy;

    this.groupRenderStrategy.set(groupRenderStrategy);
  }
}
