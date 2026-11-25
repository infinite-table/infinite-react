import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceGroupBy,
  InfiniteTableColumnRenderValueParam,
  InfiniteTablePropColumns,
  InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-angular';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      [defaultGroupBy]="defaultGroupBy"
    >
      <infinite-table
        debugId="column-renderValue-example"
        [groupColumn]="groupColumn"
        [columns]="columns"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>

    <!-- #highlight the templates the columns render, with the render params as context -->
    <ng-template #stack let-data="data">
      <b>🎇 {{ data?.stack }}</b>
    </ng-template>

    <ng-template #groupedBy let-rowInfo="rowInfo">
      Grouped by <b>{{ rowInfo.value }}</b>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;

  private readonly stackTemplate =
    viewChild.required<TemplateRef<unknown>>('stack');
  private readonly groupedByTemplate =
    viewChild.required<TemplateRef<unknown>>('groupedBy');

  // the columns are a plain field: a template goes in through a function
  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    stack: {
      field: 'stack',
      renderValue: ({ rowInfo }) => {
        if (rowInfo.isGroupRow) {
          return `${rowInfo.value} stuff`;
        }

        return this.stackTemplate();
      },
    },
    firstName: {
      field: 'firstName',
    },

    preferredLanguage: { field: 'preferredLanguage' },
  };

  protected readonly defaultGroupBy: DataSourceGroupBy<Developer>[] = [
    { field: 'stack' },
  ];

  protected readonly groupColumn: InfiniteTablePropGroupColumn<Developer> = {
    defaultWidth: 250,

    renderValue: ({
      rowInfo,
    }: InfiniteTableColumnRenderValueParam<Developer>) => {
      if (rowInfo.isGroupRow) {
        return this.groupedByTemplate();
      }
      return null;
    },
  };
}
