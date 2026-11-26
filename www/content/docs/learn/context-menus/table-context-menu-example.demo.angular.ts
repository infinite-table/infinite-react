import { Component } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetContextMenuItems,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    header: 'Name',
    defaultWidth: 120,
  },
  age: {
    field: 'age',
    header: 'Age',
    defaultWidth: 100,
  },
  preferredLanguage: {
    header: 'Language',
    defaultWidth: 120,
    field: 'preferredLanguage',
  },
};

const getContextMenuItems: InfiniteTablePropGetContextMenuItems<Developer> = ({
  data,
  column,
}) => {
  if (!data)
    return [
      {
        key: 'add',
        label: 'Add Item',
        onClick: () => {
          alert('Add Item');
        },
      },
    ];

  return [
    {
      key: 'hello',
      label: `Hello, ${data?.lastName} ${data?.firstName}`,
      onClick: () => {
        alert(`Hello, ${data?.lastName} ${data?.firstName}`);
      },
    },
    {
      key: 'col',
      label: `Current clicked column: ${column?.header}`,
    },
    {
      key: 'learn',
      label: `Learn`,
      menu: {
        items: [
          {
            key: 'backend',
            label: 'Backend',
            onClick: () => {
              alert(`Learn Backend, ${data?.lastName} ${data?.firstName}`);
            },
          },
          {
            key: 'frontend',
            label: 'Frontend',
            onClick: () => {
              alert(`Learn Frontend, ${data?.lastName} ${data?.firstName}`);
            },
          },
        ],
      },
    },
  ];
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="table-context-menu-example"
        [columns]="columns"
        [getContextMenuItems]="getContextMenuItems"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly getContextMenuItems = getContextMenuItems;
}
