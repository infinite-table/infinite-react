import { Component, signal, computed } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './people';
import type { Person } from './people';

const columns: Record<string, any> = {
  name: {
    field: 'name',
  },
  country: {
    field: 'country',
  },
  department: {
    field: 'department',
    header: 'Department',
    style: {
      color: 'red',
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  team: {
    field: 'team',
  },
};
const columnAggregations = {
  salary: {
    initialValue: 0,
    field: 'salary' as const,
    reducer: (acc: number, sum: number) => acc + sum,
    done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
  },
};

const useField = signal(true);
const useKnownGroupField = signal(false);

const groupBy = computed<any[]>(() => {
  if (useField()) {
    return [
      {
        field: 'department',
      },
      { field: 'team' },
    ];
  }

  return [
    {
      groupField: useKnownGroupField() ? 'department' : 'xxx',
      valueGetter: ({ data }: { data: Person }) =>
        `Department: ${data.department}-${data.age}`,
    },
    { field: 'team' },
  ];
});

const slicedData = data.slice(0, 5);

const groupColumn = {
  field: 'department' as const,
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
  imports: [DataSource, InfiniteTable],
  template: `
    <label [style]="{ color: 'magenta' }">
      Use field in groupBy
      <input
        type="checkbox"
        [checked]="useField()"
        (change)="useField.set(!useField())"
      />
    </label>

    <label [style]="{ color: 'magenta' }">
      Use known group field in groupBy
      <input
        type="checkbox"
        [checked]="useKnownGroupField()"
        (change)="useKnownGroupField.set(!useKnownGroupField())"
      />
    </label>
    <infinite-data-source
      [data]="slicedData"
      primaryKey="id"
      [groupBy]="groupBy()"
      [aggregationReducers]="columnAggregations"
    >
      <infinite-table
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        groupRenderStrategy="single-column"
        [columnDefaultWidth]="250"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class GroupByWithValueGetterSingleColumnPage {
  protected readonly columns = columns;
  protected readonly columnAggregations = columnAggregations;
  protected readonly useField = useField;
  protected readonly useKnownGroupField = useKnownGroupField;
  protected readonly groupBy = groupBy;
  protected readonly slicedData = slicedData;
  protected readonly groupColumn = groupColumn;
  protected readonly domProps = domProps;
  protected readonly data = data;
}
