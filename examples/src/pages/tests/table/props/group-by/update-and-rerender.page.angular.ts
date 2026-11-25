import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  renderTemplate,
} from '@infinite-table/infinite-angular';

import { data } from './people';
import type { Person } from './people';

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [groupBy]="groupBy"
      [aggregationReducers]="columnAggregations"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>

    <ng-template #ageHeader let-now="now">
      <div>Age-{{ now }}</div>
    </ng-template>

    <ng-template #salaryGroup let-rowInfo="rowInfo">Avg salary <b>{{ rowInfo.groupKeys?.join(', ') }}</b>: <b>{{ rowInfo.reducerResults[0] }}</b></ng-template>
  `,
})
export default class UpdateAndRerenderPage {
  protected readonly data = data;

  private readonly ageHeader =
    viewChild.required<TemplateRef<{ now: number }>>('ageHeader');
  private readonly salaryGroup =
    viewChild.required<TemplateRef<unknown>>('salaryGroup');

  protected readonly columns: Record<string, any> = {
    name: {
      field: 'name',
    },
    country: {
      field: 'country',
    },
    department: {
      field: 'department',
    },
    age: {
      field: 'age',
      type: 'number',
      defaultEditable: true,
      renderValue: ({ value }: { value: any }) => {
        return `${value}-${Date.now()}`;
      },
      header: () => {
        // a new context on every render, as the React/Vue header renders
        // Date.now() every time
        return renderTemplate(this.ageHeader(), { now: Date.now() });
      },
      getValueToPersist: ({ value }: { value: any }) => {
        return Number(value);
      },
    },
    salary: {
      field: 'salary',
      type: 'number',

      render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
        if (rowInfo.isGroupRow) {
          return this.salaryGroup();
        }
        return `${value}`;
      },
    },
    team: {
      field: 'team',
    },
  };

  protected readonly columnAggregations = {
    salary: {
      initialValue: 0,
      field: 'salary' as const,
      reducer: (acc: number, sum: number) => acc + sum,
      done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
    },
    age: {
      initialValue: 0,
      field: 'age' as const,
      reducer: (acc: number, sum: number) => acc + sum,
      done: (sum: number, arr: any[]) =>
        arr.length ? Math.round((sum / arr.length) * 100) / 100 : 0,
    },
  };

  protected readonly groupBy = [
    { field: 'department' as keyof Person },
    { field: 'team' as keyof Person },
  ];

  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '80vh',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
