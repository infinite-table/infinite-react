import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourcePropSortInfo } from '@infinite-table/infinite-angular';

import { data, type Developer } from './grouped-single-group-column.data';

const defaultSortInfo: DataSourcePropSortInfo<Developer> = [
  {
    dir: 1,
    id: 'group-by',
    field: ['stack', 'preferredLanguage'] as (keyof Developer)[],
  },
  // { dir: 1, field: 'age' },
];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
    // sortable: true,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
};

const defaultGroupBy = [
  {
    field: 'stack' as const,
  },
  {
    field: 'preferredLanguage' as const,
  },
];

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="toggle()">
      {{ hideGroupColumns() ? 'show' : 'hide' }}
    </button>
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultSortInfo]="defaultSortInfo"
      [defaultGroupBy]="defaultGroupBy"
    >
      <infinite-table
        [domProps]="domProps"
        groupRenderStrategy="single-column"
        [rowHeight]="40"
        [hideColumnWhenGrouped]="hideGroupColumns()"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class GroupedSingleGroupColumnPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly domProps = domProps;

  protected readonly hideGroupColumns = signal(true);

  protected toggle() {
    this.hideGroupColumns.set(!this.hideGroupColumns());
  }
}
