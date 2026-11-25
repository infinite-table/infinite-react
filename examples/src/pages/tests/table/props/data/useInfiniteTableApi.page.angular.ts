import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectColumnCell,
  injectInfiniteTable,
  renderComponent,
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

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    city: 'Unnao',
    age: 40,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Axel',
    lastName: 'Runolfsson',
    country: 'Mexico',

    city: 'Cuitlahuac',

    age: 20,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 100000,
    hobby: 'sports',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    lastName: 'McGlynn',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 60,
    currency: 'JPY',
    preferredLanguage: 'Go',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 120000,
    hobby: 'photography',
  },
];

const dataSource = () => {
  return developers;
};

const clickedId = signal<number | null>(null);
const clickedFirstName = signal<string | null>(null);

@Component({
  selector: 'identifier-cell',
  template: `<div>ID: <b>{{ cell().value }}</b><button (click)="onClick()">click to show context menu</button></div>`,
})
class IdentifierCell {
  protected readonly cell = injectColumnCell<Developer>();
  private readonly tableContext = injectInfiniteTable<Developer>();

  protected onClick() {
    const value = this.cell().value;
    const id = this.tableContext.api
      .getColumnApi('identifier')
      ?.getCellValueByPrimaryKey(value);
    clickedId.set(id);
  }
}

@Component({
  selector: 'first-name-cell',
  template: `<div><b>{{ cell().value }}</b><button (click)="onClick()">click me</button></div>`,
})
class FirstNameCell {
  protected readonly cell = injectColumnCell<Developer>();
  private readonly tableContext = injectInfiniteTable<Developer>();

  protected onClick() {
    const data = this.cell().data;
    const columnApi = this.tableContext.api.getColumnApi('firstName');
    const firstName = columnApi?.getCellValueByPrimaryKey(data!.id);
    clickedFirstName.set(firstName);
  }
}

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
    render: () => renderComponent(IdentifierCell),
  },
  firstName: {
    // valueFormatter: ({ value }) => `Name: ${value}`,
    render: () => renderComponent(FirstNameCell),
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }: { data: Developer | null }) => {
      return `${data?.firstName} - ${data?.lastName}`;
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};

const domProps = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

const getCellContextMenuItems = ({
  column,
  value,
}: {
  column: any;
  value: any;
}) => {
  if (column.id === 'identifier') {
    return [
      {
        label: `Hello ${value}`,
        key: 'hello',
      },
    ];
  }

  return [
    {
      label: `hi ${value}`,
      key: 'hi',
    },
    {
      label: `hi ${value} - item 2`,
      key: 'hi2',
    },
  ];
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div data-testid="clicked-id">clicked id: {{ clickedId() }}</div>
    <div data-testid="clicked-firstName">
      clicked firstName: {{ clickedFirstName() }}
    </div>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
        [getCellContextMenuItems]="getCellContextMenuItems"
      />
    </infinite-data-source>
  `,
})
export default class UseInfiniteTableApiPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly getCellContextMenuItems = getCellContextMenuItems;
  protected readonly clickedId = clickedId;
  protected readonly clickedFirstName = clickedFirstName;
}
