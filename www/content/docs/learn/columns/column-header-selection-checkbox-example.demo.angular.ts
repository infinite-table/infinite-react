import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
  InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-angular';

const defaultGroupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'canDesign',
  },
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const domProps = {
  style: {
    flex: 1,
    minHeight: 500,
  },
};

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
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable, InfiniteRender],
  template: `
    <infinite-data-source
      [data]="dataSource"
      [groupBy]="defaultGroupBy"
      selectionMode="multi-row"
      primaryKey="id"
    >
      <infinite-table
        debugId="column-header-selection-checkbox-example"
        [columns]="columns"
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>

    <!-- #highlight render the default checkbox and decorate it -->
    <ng-template #decoratedCheckBox let-renderBag="renderBag">
      <b>[<ng-container [infiniteRender]="renderBag.selectionCheckBox" />]</b>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly domProps = domProps;

  private readonly decoratedCheckBox =
    viewChild.required<TemplateRef<unknown>>('decoratedCheckBox');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    country: {
      field: 'country',
    },
    firstName: {
      field: 'firstName',
      defaultHiddenWhenGroupedBy: '*',
    },
    stack: {
      renderSelectionCheckBox: true,
      renderHeaderSelectionCheckBox: () => this.decoratedCheckBox(),
      field: 'stack',
    },
    age: { field: 'age' },
    id: { field: 'id' },
    preferredLanguage: {
      field: 'preferredLanguage',
    },
    canDesign: {
      field: 'canDesign',
    },
  };

  protected readonly groupColumn: InfiniteTablePropGroupColumn<Developer> = {
    field: 'firstName',
    renderHeaderSelectionCheckBox: () => this.decoratedCheckBox(),
    defaultWidth: 300,
  };
}
