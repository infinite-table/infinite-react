import { Component, signal } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';



import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetColumnMenuItems,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const msg = signal('');
const setMsg = (value: string) => {
  msg.set(value);
};

const getColumnMenuItems: InfiniteTablePropGetColumnMenuItems<Developer> = (
  items,
  { column },
) => {
  if (column.id === 'currency') {
    return [];
  }
  items.push({
    key: 'hi',
    label: 'Hello',
    onClick: () => {
      setMsg('hello ' + column.id);
    },
  });

  if (column.id === 'age') {
    items.push({
      key: 'ageitem',
      label: 'Age',
      onClick: () => {
        setMsg('age!');
      },
    });
  }
  return items;
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <div data-name="msg" style="color: magenta">{{ msg() }}</div>
  <infinite-data-source [data]="data" primaryKey="id">
    <infinite-table
      [domProps]="domProps"
      [getColumnMenuItems]="getColumnMenuItems"
      [columnDefaultWidth]="100"
      [columnMinWidth]="50"
      [columns]="columns"
    />
  </infinite-data-source>
  `,
})
export default class DefaultPage {
  protected readonly columns = columns;
  protected readonly data = data;
  protected readonly domProps = domProps;
  protected readonly getColumnMenuItems = getColumnMenuItems;
  protected readonly msg = msg;
}
