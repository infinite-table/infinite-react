import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-angular';
import sinon from 'sinon';

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

const columns: InfiniteTablePropColumns<Developer> = {
  index: {
    renderValue: ({ rowInfo }: any) => {
      return `${rowInfo.indexInAll}`;
    },
    defaultFlex: 1,
    renderMenuIcon: false,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
    defaultFlex: 3,
    renderMenuIcon: false,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultFlex: 2,
    renderMenuIcon: false,
  },
  age: { field: 'age', defaultWidth: 200, renderMenuIcon: false },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  const url = process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`;
  return fetch(url)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const onColumnSizingChangeSpy = sinon.spy((_rowHeight: number) => {});
const onViewportReservedWidthChangeSpy = sinon.spy((_width: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChangeSpy;
(globalThis as any).onViewportReservedWidthChange =
  onViewportReservedWidthChangeSpy;

const initialWidth = ((globalThis as any).initialWidth = 802);

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button data-name="inc" (click)="width.set(width() + 100)">+ 100px</button>
    <button data-name="inc" (click)="width.set(width() - 100)">- 100px</button>
    <label style="color: magenta" data-name="label" [attr.data-value]="width()">
      current width: {{ width() }}
    </label>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps()"
        [columnMinWidth]="50"
        (columnSizingChange)="onColumnSizingChange($event)"
        (viewportReservedWidthChange)="onViewportReservedWidthChange($event)"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ResizeFlexColsPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly width = signal(initialWidth);
  protected readonly domProps = computed(() => ({
    style: {
      margin: '5px',
      height: '500px',
      width: `${this.width()}px`,
      border: '1px solid gray',
      position: 'relative' as const,
    },
  }));

  protected onColumnSizingChange(columnSizing: any) {
    onColumnSizingChangeSpy(columnSizing);
  }
  protected onViewportReservedWidthChange(reservedWidth: any) {
    onViewportReservedWidthChangeSpy(reservedWidth);
  }
}
