import { Component, input } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourcePropFilterTypes,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

@Component({
  selector: 'operator-icon',
  host: {
    style:
      'width: 20px; display: flex; justify-content: center; flex-flow: row',
  },
  template: `{{ icon() }}`,
})
class OperatorIcon {
  readonly icon = input.required<string>();
}

function getIcon(icon: string) {
  return () => renderComponent(OperatorIcon, { inputs: { icon } });
}

const filterTypes: DataSourcePropFilterTypes<Developer> = {
  salary: {
    defaultOperator: 'gt',
    emptyValues: ['', null, undefined],
    operators: [
      {
        name: 'gt',
        label: 'Greater Than',
        components: {
          Icon: getIcon('>'),
        },
        fn: ({ currentValue, filterValue }) => {
          return currentValue > filterValue;
        },
      },
      {
        name: 'gte',
        components: {
          Icon: getIcon('>='),
        },
        label: 'Greater Than or Equal',
        fn: ({ currentValue, filterValue }) => {
          return currentValue >= filterValue;
        },
      },
      {
        name: 'lt',
        components: {
          Icon: getIcon('<'),
        },
        label: 'Less Than',
        fn: ({ currentValue, filterValue }) => {
          return currentValue < filterValue;
        },
      },
      {
        name: 'lte',
        components: {
          Icon: getIcon('<='),
        },
        label: 'Less Than or Equal',
        fn: ({ currentValue, filterValue }) => {
          return currentValue <= filterValue;
        },
      },
    ],
  },
};

const domProps = {
  style: {
    height: '100%',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultFilterValue]="[]"
      [filterDelay]="0"
      [filterTypes]="filterTypes"
    >
      <infinite-table
        debugId="filter-custom-filter-type-example"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly filterTypes = filterTypes;
  protected readonly domProps = domProps;
  protected readonly columns = columns;
}
