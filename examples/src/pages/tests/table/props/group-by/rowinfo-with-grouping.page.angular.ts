import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './rowinfo-with-grouping-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
    render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
      return `${value} ${rowInfo.indexInAll}!`;
    },
  },
};
const groupBy = [
  {
    field: 'country' as const,
  },
  { field: 'city' as const },
];

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const setDataArray = (dataArray: any) => {
  (globalThis as any).dataArray = dataArray;
  return '';
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy"
    >
      {{ setDataArray(ds.dataArray()) }}
      <infinite-table
        [domProps]="domProps"
        groupRenderStrategy="single-column"
        [columnDefaultWidth]="300"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class RowInfoWithGroupingPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;
  protected readonly setDataArray = setDataArray;
}
