import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type {
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-angular';

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

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
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
    <button (click)="toggle()">toggle firstName with custom render</button>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns()"
      />
    </infinite-data-source>
  `,
})
export default class ColumnChangePage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;

  private readonly useCustomNameRender = signal(false);

  protected readonly columns = computed<InfiniteTablePropColumns<Developer>>(
    () => {
      const useCustomNameRender = this.useCustomNameRender();
      return {
        firstName: {
          field: useCustomNameRender ? 'lastName' : 'firstName',
          defaultWidth: useCustomNameRender ? 500 : 200,
          render: useCustomNameRender
            ? ({ value }: { value: any }) => {
                return value + '!!!';
              }
            : undefined,
        },
        salary: {
          field: 'salary',
          type: 'number',
        },

        stack: { field: 'stack' },
      };
    },
  );

  protected toggle() {
    this.useCustomNameRender.set(!this.useCustomNameRender());
  }
}
