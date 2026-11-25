import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './pivot-grouping-example-data';

const columns: Record<string, any> = {
  id: { field: 'id' },
  name: { field: 'name' },
  language: { field: 'language' },
  license: { field: 'license' },
};

const groupBy = [{ field: 'language' as const }];
const pivotBy = [{ field: 'license' as const }];

const domProps = {
  style: {
    height: '80vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="data"
      [groupBy]="groupBy"
      [pivotBy]="pivotBy"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [hideEmptyGroupColumns]="true"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
      />
    </infinite-data-source>
  `,
})
export default class PivotColumnsNoAggsPage {
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly pivotBy = pivotBy;
  protected readonly domProps = domProps;
  protected readonly data = data;
}
