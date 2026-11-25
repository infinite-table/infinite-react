import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns, data, minHeight500DomProps } from './common';

const dataSource = () => {
  return Promise.resolve(data.slice(0, data.length - 1));
};

// the React page pushes 'hover-row' into the static
// InfiniteTable.Body.rowHoverClassName array - the Angular build has no Body
// sub-component, so the equivalent top-level input is used

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
export default class WithRowHoverStaticOnBodyPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly minHeight500DomProps = minHeight500DomProps;
}
