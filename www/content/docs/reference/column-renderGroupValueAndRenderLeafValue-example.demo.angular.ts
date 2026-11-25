import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  renderTemplate,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
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

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => `Country: ${value}`,
    },
  },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id" [groupBy]="groupBy">
      <infinite-table
        debugId="column-renderGroupValueAndRenderLeafValue-example"
        [columns]="columns"
      />
    </infinite-data-source>

    <!-- #highlight the markup renderLeafValue returns -->
    <ng-template #leafValue let-value="value" let-rowInfo="rowInfo">
      <b>🎇 {{ value }} → {{ rowInfo.value }}</b>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly groupBy = groupBy;

  private readonly leafValueTemplate =
    viewChild.required<TemplateRef<unknown>>('leafValue');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    stack: {
      field: 'stack',
      renderGroupValue: ({ rowInfo, value }) => {
        // value is undefined in the country group rows
        return `${value ?? ''} → ${rowInfo.value} stuff`;
      },
      renderLeafValue: ({ value, rowInfo }) => {
        return renderTemplate(this.leafValueTemplate(), { value, rowInfo });
      },
    },
    firstName: {
      field: 'firstName',
    },

    preferredLanguage: { field: 'preferredLanguage' },
  };
}
