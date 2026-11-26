import { Component } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
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
  stack: {
    field: 'stack',
    header: 'Stack',
  },
  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  age: {
    field: 'age',
    header: 'Age',
  },
  hobby: {
    field: 'hobby',
    header: 'Hobby',
  },
  preferredLanguage: {
    header: 'Language',
    field: 'preferredLanguage',
  },
};

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = ({ data, column }) => {
  const columns = [
    { name: 'icon' },
    { name: 'label' },
    { name: 'description' },
  ];
  return {
    columns,
    items: [
      {
        key: 'hello',
        icon: '👋',
        label: `Hello, ${data?.lastName} ${data?.firstName}`,
        description: `This is a description for ${data?.lastName}`,
      },
      {
        key: 'col',
        icon: '🙌',
        label: `Column: ${column.header}`,
        description: `Current clicked column: ${column.header}`,
      },
      {
        key: 'learn',
        icon: '📚',
        label: `Learn`,
        description: `Learn more about ${data?.preferredLanguage}`,
        menu: {
          columns,
          items: [
            {
              key: 'backend',
              label: 'Backend',
              icon: '👨‍💻',
              description: 'In the Backend',
            },
            {
              key: 'frontend',
              label: 'Frontend',
              icon: '👨‍💻',
              description: 'In the Frontend',
            },
          ],
        },
      },
    ],
  };
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="cells-with-custom-columns-context-menu-example"
        [columns]="columns"
        [columnDefaultEditable]="true"
        [getCellContextMenuItems]="getCellContextMenuItems"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly getCellContextMenuItems = getCellContextMenuItems;
}
