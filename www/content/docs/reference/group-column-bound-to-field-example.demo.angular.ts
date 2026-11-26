import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceProps,
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-angular';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  canDesign: {
    field: 'canDesign',
    renderGroupValue: ({ value }) => `Can design: ${value || ''}`,
  },
};

const defaultGroupBy: DataSourceProps<Developer>['groupBy'] = [
  {
    field: 'canDesign',
  },
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const groupColumn: InfiniteTableProps<Developer>['groupColumn'] = {
  field: 'firstName',
  renderSelectionCheckBox: true,
  defaultWidth: 300,
};

const domProps = {
  style: {
    flex: 1,
    minHeight: 500,
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      [groupBy]="defaultGroupBy"
      selectionMode="multi-row"
      primaryKey="id"
    >
      <infinite-table
        debugId="group-column-bound-to-field-example"
        [columns]="columns"
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly groupColumn = groupColumn;
  protected readonly domProps = domProps;
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
