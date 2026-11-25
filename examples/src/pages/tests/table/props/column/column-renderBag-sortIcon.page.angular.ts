import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropSortInfo,
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

const defaultSortInfo: DataSourcePropSortInfo<Developer> = {
  field: 'firstName',
  dir: 1,
};

const domProps = {
  style: { height: '80vh' },
};

@Component({
  imports: [DataSource, InfiniteTable, InfiniteRender],
  template: `
    <!-- the default sort icon, re-emitted from the render bag -->
    <ng-template #sortIcon let-renderBag="renderBag">
      <span>hey <ng-container [infiniteRender]="renderBag.sortIcon" /></span>
    </ng-template>
    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      [defaultSortInfo]="defaultSortInfo"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class ColumnRenderBagSortIconPage {
  private readonly sortIconTpl = viewChild.required<TemplateRef<unknown>>('sortIcon');

  protected readonly dataSource = dataSource;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly domProps = domProps;

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    stack: {
      field: 'stack',
    },
    firstName: {
      field: 'firstName',
      header: () => 'First Name',
      renderSortIcon: () => this.sortIconTpl(),
    },
    preferredLanguage: { field: 'preferredLanguage' },
  };
}
