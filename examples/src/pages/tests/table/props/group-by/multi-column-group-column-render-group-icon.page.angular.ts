import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  language: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Australia', language: 'Go' },
  { id: 2, firstName: 'John', country: 'Australia', language: 'Java' },
  { id: 3, firstName: 'Emma', country: 'Brazil', language: 'Go' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
};

const groupBy: DataSourceGroupBy<Developer>[] = [
  { field: 'country' },
  { field: 'language' },
];

const domProps = {
  style: { height: '80vh' },
};

@Component({
  imports: [DataSource, InfiniteTable, InfiniteRender],
  template: `
    <infinite-data-source primaryKey="id" [data]="data" [groupBy]="groupBy">
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        groupRenderStrategy="multi-column"
        [groupColumn]="groupColumn"
      />
    </infinite-data-source>

    <ng-template #groupIcon let-renderBag="renderBag">
      <span data-name="custom-group-icon"
        ><ng-container [infiniteRender]="renderBag.groupIcon"
      /></span>
    </ng-template>
  `,
})
export default class MultiColumnGroupColumnRenderGroupIconPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;

  private readonly groupIconTpl =
    viewChild.required<TemplateRef<unknown>>('groupIcon');

  // wraps the default icon, so the test can tell where it is called
  protected readonly groupColumn = () => ({
    renderGroupIcon: () => this.groupIconTpl(),
  });
}
