import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourcePropFilterValue,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const domProps = {
  style: {
    height: '100%',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultFilterValue]="defaultFilterValue"
      [filterDelay]="0"
    >
      <infinite-table
        debugId="column-filter-icon-example"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>

    <ng-template #boldSalary>
      <b>Salary</b>
    </ng-template>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly domProps = domProps;
  protected readonly defaultFilterValue: DataSourcePropFilterValue<Developer> =
    [];

  private readonly boldSalaryTemplate =
    viewChild.required<TemplateRef<unknown>>('boldSalary');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: {
      field: 'id',
      type: 'number',
      defaultWidth: 100,
    },
    salary: {
      field: 'salary',
      type: 'number',
      header: ({ filtered }) => {
        return filtered ? this.boldSalaryTemplate() : 'Salary'; // #highlight
      },

      renderFilterIcon: () => {
        return null;
      },
    },

    firstName: {
      field: 'firstName',
      renderFilterIcon: ({ filtered }) => {
        return filtered ? '🔥' : ''; // #highlight
      },
    },
    stack: { field: 'stack' },
    currency: { field: 'currency' },
  };
}
