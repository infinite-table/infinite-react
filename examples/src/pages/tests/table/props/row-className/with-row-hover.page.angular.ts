import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns, data, minHeight500DomProps } from './common';

const dataSource = () => {
  return Promise.resolve(data.slice(0, data.length - 1));
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [columns]="columns"
        rowClassName="custom-row"
        rowHoverClassName="hover-row"
        [domProps]="minHeight500DomProps"
      />
    </infinite-data-source>
  `,
})
export default class WithRowHoverPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly minHeight500DomProps = minHeight500DomProps;
}
