import { Component, input } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumn,
  Renderable,
} from '@infinite-table/infinite-angular';

// the components.LoadMask override gets the same inputs as the default one
@Component({
  selector: 'custom-load-mask',
  host: {
    style:
      'width: 100%; height: 100%; z-index: 100; background: tomato; opacity: 0.3; display: flex; align-items: center; justify-content: center',
  },
  template: `
    <div
      style="padding: 20px; background: white; color: black; border-radius: 5px"
    >
      Loading App ...
    </div>
  `,
})
class LoadMask {
  readonly visible = input<boolean>(false);
  readonly loadingText = input<Renderable>();
}

type Employee = {
  id: string | number;
  name: string;
  salary: number;
  department: string;
  company: string;
};

const employees: Employee[] = [
  {
    id: 1,
    name: 'Bob',
    salary: 10_000,
    department: 'IT',
    company: 'Bobsons',
  },
  {
    id: 2,
    name: 'Alice',
    salary: 20_000,
    department: 'IT',
    company: 'Bobsons',
  },
];

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 80,
  },
  name: {
    field: 'name',
  },
  salary: { field: 'salary', type: 'number' },
  department: { field: 'department', header: 'Dep.' },
  company: { field: 'company' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [loading]="true" [data]="employees" primaryKey="id">
      <infinite-table
        debugId="load-mask-example"
        [components]="components"
        [columnDefaultWidth]="130"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly employees = employees;
  protected readonly columns = columns;
  protected readonly components = { LoadMask };
}
