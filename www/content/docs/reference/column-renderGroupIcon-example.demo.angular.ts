import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  InfiniteTableColumn,
  InfiniteTablePropColumns,
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

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
  },
  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
};
const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => `Country: ${value}`,
    },
  },
  { field: 'preferredLanguage' },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id" [groupBy]="groupBy">
      <infinite-table
        debugId="column-renderGroupIcon-example"
        [columns]="columns"
        [groupColumn]="groupColumn"
      />
    </infinite-data-source>

    <!-- #highlight the group icon, with the render params as context -->
    <ng-template
      #groupIcon
      let-rowInfo="rowInfo"
      let-toggleCurrentGroupRow="toggleCurrentGroupRow"
    >
      <div
        (click)="toggleCurrentGroupRow()"
        style="cursor: pointer; margin-right: 10px"
      >
        {{ rowInfo.isGroupRow ? (rowInfo.collapsed ? '👇' : '👉') : '' }}
      </div>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;

  private readonly groupIconTemplate =
    viewChild.required<TemplateRef<unknown>>('groupIcon');

  protected readonly groupColumn: InfiniteTableColumn<Developer> = {
    renderGroupIcon: () => this.groupIconTemplate(),
  };
}
