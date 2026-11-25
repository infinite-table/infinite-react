import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
} from '@infinite-table/infinite-angular';

import { columns } from './rowStyle-example-columns.angular';
import type { Employee } from './rowStyle-example-columns.angular';

const rowStyle: InfiniteTablePropRowStyle<Employee> = (param: {
  rowInfo: InfiniteTableRowInfo<Employee>;
}) => {
  const { rowInfo } = param;
  if (rowInfo.isGroupRow) {
    return;
  }
  const { data } = rowInfo;
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }

  if (rowInfo.indexInAll % 10 === 0) {
    return { background: 'lightblue', color: 'black' };
  }
  return undefined;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="rowStyle-example"
        [columns]="columns"
        [rowStyle]="rowStyle"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly rowStyle = rowStyle;
}
