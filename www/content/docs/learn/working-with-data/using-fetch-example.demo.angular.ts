import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns } from './columns.angular';
import type { Employee } from './columns.angular';

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees10k')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table debugId="using-fetch-example" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
}
