import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-angular';

import { employees } from '../group-by/employees10';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => employees as Employee[];
const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id' },
  country: {
    field: 'country',
    type: 'country',
    defaultWidth: 300,
    renderMenuIcon: false,
  },
  city: { field: 'city' },
  team: { field: 'team' },
  salary: { field: 'salary', type: 'empty', renderMenuIcon: false },
  age: {
    field: 'age',
    header: 'the age field',
  },
};

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  age: {
    width: 800,
  },
  salary: {
    width: 145,
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '90vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const columnTypes = {
  default: {
    renderMenuIcon: false,
  },
};

const currentData = () => dataSource();

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="onAutoSizeClick()">auto size</button>
    <infinite-data-source primaryKey="id" [data]="currentData">
      <infinite-table
        [domProps]="domProps"
        [columnSizing]="columnSizing()"
        (columnSizingChange)="onColumnSizingChange($event!)"
        [columnMinWidth]="50"
        [columns]="columns"
        [columnTypes]="columnTypes"
        [columnDefaultWidth]="200"
        [autoSizeColumnsKey]="autoSizeColumnsKey()"
      />
    </infinite-data-source>
  `,
})
export default class AutoSizeColumnsPage {
  protected readonly currentData = currentData;
  protected readonly columns = columns;
  protected readonly columnTypes = columnTypes;
  protected readonly domProps = domProps;

  private readonly autoSizeId = signal(0);

  protected readonly columnSizing =
    signal<InfiniteTablePropColumnSizing>(defaultColumnSizing);

  protected onColumnSizingChange(sizing: InfiniteTablePropColumnSizing) {
    this.columnSizing.set(sizing);
  }

  protected readonly autoSizeColumnsKey = computed(() => {
    const autoSizeValue = (globalThis as any).autoSize;
    const autoSizeId = this.autoSizeId();
    return autoSizeId
      ? typeof (autoSizeValue === 'number')
        ? autoSizeValue
        : {
            key: autoSizeId,

            ...(autoSizeValue || {}),
          }
      : undefined;
  });

  protected onAutoSizeClick() {
    this.autoSizeId.set(this.autoSizeId() + 1);
  }
}
