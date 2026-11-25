import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
  InfiniteTablePropKeyboardShorcut,
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

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage', header: 'Language' },
  country: { field: 'country', header: 'Country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const keyboardShortcuts: InfiniteTablePropKeyboardShorcut[] = [
  {
    key: 'Shift+Enter',
    when: (context) => !!context.getState().activeCellIndex,
    handler: (context) => {
      const { activeCellIndex } = context.getState();

      const [rowIndex, columnIndex] = activeCellIndex!;
      alert(`Current active cell: row ${rowIndex}, column ${columnIndex}.`);
    },
  },
  {
    key: 'PageUp',
    handler: () => {
      console.log('PageUp key pressed.');
    },
  },
  {
    key: 'PageDown',
    handler: () => {
      console.log('PageDown key pressed.');
    },
  },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="keyboard-shortcuts-initial-example"
        [columns]="columns"
        [keyboardShortcuts]="keyboardShortcuts"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly keyboardShortcuts = keyboardShortcuts;
}
