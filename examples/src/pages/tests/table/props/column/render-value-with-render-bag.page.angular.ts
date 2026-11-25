import { Component, TemplateRef, signal, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

import { Employee } from './employees10';

const dataSource = () => {
  const data: Employee[] = [
    {
      age: 1,
      city: 'test',
      companyName: 'test',
      companySize: '1 - 10',
      country: 'test',
      countryCode: 'test',
      department: 'test',
      email: 'test@test.com',
      firstName: 'Mark',
      lastName: 'test',
      id: 1,
      salary: 5000,
      streetName: 'test',
      streetNo: 1,
      team: 'test',
    },
  ];

  return Promise.resolve(data);
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable, InfiniteRender],
  template: `
    <button (click)="increment()">increment state</button>
    Current state: {{ state() }}
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>

    <ng-template #valueTpl let-renderBag="renderBag">
      <button data-name="target">
        {{ 'x ' }}<ng-container [infiniteRender]="renderBag.value" />
      </button>
    </ng-template>
  `,
})
export default class RenderValueWithRenderBagPage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;

  protected readonly state = signal(0);

  protected increment() {
    this.state.set(this.state() + 1);
  }

  private readonly valueTpl =
    viewChild.required<TemplateRef<unknown>>('valueTpl');

  protected readonly columns: Record<string, InfiniteTableColumn<Employee>> = {
    firstName: {
      field: 'firstName',
      header: 'First Name',
      renderValue: () => {
        return this.valueTpl();
      },
    },
  };
}
