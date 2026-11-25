import { Component, computed, signal } from '@angular/core';

import {
  InfiniteTable,
  DataSource,
  debounce,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  HTMLProps,
  InfiniteTablePropColumns,
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
  return fetch(
    'https://infinite-table.com/.netlify/functions/json-server' +
      `/developers1k-sql?`,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
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

const rgb = {
  r: 77,
  g: 149,
  b: 215,
};
const defaultColor = `#${rgb.r.toString(16)}${rgb.g.toString(
  16,
)}${rgb.b.toString(16)}`;

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="color: var(--infinite-cell-color)">
      Select color
      <input type="color" [value]="defaultColor" (input)="onChange($event)" />
    </div>
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="navigating-cells-theming-example"
        [defaultActiveCellIndex]="[5, 0]"
        [domProps]="domProps()"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultColor = defaultColor;

  private readonly color = signal({ ...rgb });

  protected readonly domProps = computed(() => {
    const color = this.color();
    return {
      style: {
        '--infinite-active-cell-border-color--r': color.r,
        '--infinite-active-cell-border-color--g': color.g,
        '--infinite-active-cell-border-color--b': color.b,
        // for the same of the example being more obvious,
        // make the opacity of the unfocused table same as the one used on focus
        '--infinite-active-cell-background-alpha--table-unfocused': '0.25', // but this defaults to 0.1
      },
    } as HTMLProps<HTMLDivElement>;
  });

  protected readonly onChange = debounce(
    (event: Event) => {
      const value = (event.target as HTMLInputElement).value;

      const r = parseInt(value.substr(1, 2), 16);
      const g = parseInt(value.substr(3, 2), 16);
      const b = parseInt(value.substr(5, 2), 16);

      this.color.set({
        r,
        g,
        b,
      });
    },
    { wait: 200 },
  );
}
