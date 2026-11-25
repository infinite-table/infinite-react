import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  InfiniteTableApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const CURRENCIES = ['USD', 'CAD', 'EUR'];
const stacks = ['frontend', 'backend', 'fullstack'];

let ID = 0;

const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Mike', 'Molly'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones'];
const getRow = (count?: number): Developer => {
  return {
    id: ID++,
    firstName:
      ID === 1
        ? 'ROCKY'
        : firstNames[getRandomInt(0, firstNames.length - 1)] +
          (count ? ` ${count}` : ''),
    lastName: lastNames[getRandomInt(0, firstNames.length - 1)],

    currency: CURRENCIES[getRandomInt(0, 2)],
    salary: getRandomInt(1000, 10000),
    preferredLanguage: 'JavaScript',
    stack: stacks[getRandomInt(0, 2)],
    canDesign: getRandomInt(0, 1) === 0 ? 'yes' : 'no',
    age: getRandomInt(20, 100),
    reposCount: getRandomInt(0, 100),
  };
};

const dataSource: Developer[] = [...Array(10)].map(getRow);

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    style: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return {};
      }

      return {
        color: 'black',
        background:
          value > 80
            ? 'tomato'
            : value > 60
            ? 'orange'
            : value > 40
            ? 'yellow'
            : value > 20
            ? 'lightgreen'
            : 'green',
      };
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  reposCount: {
    field: 'reposCount',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

const buttonStyle = {
  border: '2px solid magenta',
  color: 'var(--infinite-cell-color)',
  background: 'var(--infinite-background)',
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <button [style]="buttonStyle" (click)="addRowAfterRocky()">
      Add row after Rocky
    </button>
    <button
      [style]="buttonStyle"
      [disabled]="!currentActivePrimaryKey()"
      (click)="addRowAfterActiveRow()"
    >
      Add row after currently active row
    </button>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="insert-example"
        [domProps]="domProps"
        (ready)="onReady($event)"
        [columnDefaultWidth]="130"
        [columnMinWidth]="50"
        [columns]="columns"
        keyboardNavigation="row"
        (activeRowIndexChange)="onActiveRowIndexChange($event)"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly buttonStyle = buttonStyle;

  private apis: {
    api: InfiniteTableApi<Developer>;
    dataSourceApi: DataSourceApi<Developer>;
  } | null = null;

  protected readonly currentActivePrimaryKey = signal<string>('');

  protected onReady(value: {
    api: InfiniteTableApi<Developer>;
    dataSourceApi: DataSourceApi<Developer>;
  }) {
    this.apis = value;
  }

  protected addRowAfterRocky() {
    if (this.apis) {
      const dataSourceApi = this.apis.dataSourceApi;
      dataSourceApi.insertData(getRow(dataSourceApi.getRowInfoArray().length), {
        primaryKey: 0,
        position: 'after',
      });
    }
  }

  protected addRowAfterActiveRow() {
    if (this.apis) {
      const dataSourceApi = this.apis.dataSourceApi;
      dataSourceApi.insertData(getRow(dataSourceApi.getRowInfoArray().length), {
        primaryKey: this.currentActivePrimaryKey(),
        position: 'after',
      });
    }
  }

  protected onActiveRowIndexChange(rowIndex: number | null | undefined) {
    if (this.apis && rowIndex != null) {
      const id = this.apis.dataSourceApi.getRowInfoArray()[rowIndex].id;

      this.currentActivePrimaryKey.set(id);
    }
  }
}
