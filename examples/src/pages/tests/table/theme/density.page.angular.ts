import { Component, computed, signal } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';


import { employees } from '../props/group-by/employees10';

const columns: Record<string, any> = {
  firstName: { field: 'firstName', header: 'First Name' },
  country: { field: 'country', header: 'Country' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
};

type Density = '' | 'compact' | 'comfortable' | 'spacious';

const densityCls = (density: Density) =>
  density ? `infinite-density--${density}` : '';

(globalThis as any).rowHeightChanges = [];
const onRowHeightChange = (rowHeight: number) => {
  (globalThis as any).rowHeightChanges.push(rowHeight);
};

const wrapperDensity = signal<Density>('');
const gridDensity = signal<Density>('');

const defaultGridDomProps = computed(() => ({
  className: densityCls(gridDensity()),
  style: { height: '400px' },
}));
const explicitGridDomProps = { style: { height: '300px' } };

const reset = () => {
  wrapperDensity.set('');
  gridDensity.set('');
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <div>
    <div>
      <button data-name="wrapper-compact" (click)="wrapperDensity.set('compact')">
        wrapper: compact
      </button>
      <button data-name="wrapper-spacious" (click)="wrapperDensity.set('spacious')">
        wrapper: spacious
      </button>
      <button data-name="grid-spacious" (click)="gridDensity.set('spacious')">
        grid: spacious
      </button>
      <button data-name="grid-comfortable" (click)="gridDensity.set('comfortable')">
        grid: comfortable
      </button>
      <button data-name="reset" (click)="reset()">reset</button>
    </div>
    <div id="wrapper" [class]="densityCls(wrapperDensity())">
      <div id="default-grid">
        <infinite-data-source [data]="employees" primaryKey="id">
          <infinite-table
            [domProps]="defaultGridDomProps()"
            (rowHeightChange)="onRowHeightChange($event)"
            [columns]="columns"
          />
        </infinite-data-source>
      </div>
      <div id="explicit-grid">
        <infinite-data-source [data]="employees" primaryKey="id">
          <infinite-table
            [domProps]="explicitGridDomProps"
            [rowHeight]="30"
            [columnHeaderHeight]="50"
            [columns]="columns"
          />
        </infinite-data-source>
      </div>
    </div>
  </div>
  `,
})
export default class DensityPage {
  protected readonly densityCls = densityCls;
  protected readonly employees = employees;
  protected readonly reset = reset;
  protected readonly wrapperDensity = wrapperDensity;
  protected readonly gridDensity = gridDensity;
  protected readonly columns = columns;
  protected readonly defaultGridDomProps = defaultGridDomProps;
  protected readonly explicitGridDomProps = explicitGridDomProps;
  protected readonly onRowHeightChange = onRowHeightChange;
}
