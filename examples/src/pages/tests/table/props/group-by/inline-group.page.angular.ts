import { Component, computed, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-angular';

import { data } from './pivotData';

const domProps = {
  style: {
    height: '60vh',
    border: '1px solid gray',
    width: 'calc(100% - 20px)',
    marginLeft: '10px',
  },
};

const formatter = new Intl.NumberFormat();
const groupBy = [
  {
    field: 'department' as const,
  },
  {
    field: 'team' as const,
  },
];

const sum = (acc: number, sum: number) => acc + sum;

const sumReducer = {
  initialValue: 0,
  getter: (data: any) => data.salary,
  reducer: sum,
};

const reducers = {
  salary: { field: 'salary' as const, ...sumReducer },
};

const groupColumn = {
  defaultWidth: 300,
};

const groupRowsState = new GroupRowsState({
  collapsedRows: [['it', 'components']],

  expandedRows: true,
});

const groupOptions = ['multi-column', 'single-column'];

const defaultColumnSizing = {
  id: { width: 70 },
  name: { width: 100 },
  country: { width: 120 },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="font-size: 16px">
      <div style="padding: 10px">
        Choose group render strategy:
        <div style="display: flex; flex-flow: column; align-items: flex-start">
          @for (option of groupOptions; track option) {
            <label style="padding: 5px; cursor: pointer">
              <input
                (change)="onStrategyChange($event)"
                style="margin-right: 10px"
                type="radio"
                name="groupRenderStrategy"
                [value]="option"
                [checked]="groupRenderStrategy() === option"
              />
              {{ option }}
            </label>
          }
        </div>
      </div>
      <div style="padding: 10px">
        Hide empty group columns:
        <input
          [disabled]="groupRenderStrategy() === 'single-column'"
          type="checkbox"
          [checked]="hideEmptyGroupColumns()"
          (change)="toggleHide()"
        />
      </div>
      <infinite-data-source
        primaryKey="id"
        [data]="data"
        [groupBy]="groupBy"
        [defaultGroupRowsState]="groupRowsState"
        [aggregationReducers]="reducers"
      >
        <infinite-table
          [domProps]="domProps"
          [columns]="columns()"
          [defaultColumnSizing]="defaultColumnSizing"
          [columnDefaultWidth]="280"
          [groupColumn]="groupColumn"
          [hideEmptyGroupColumns]="hideEmptyGroupColumns()"
          [groupRenderStrategy]="groupRenderStrategy()"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class InlineGroupPage {
  protected readonly data = data;
  protected readonly domProps = domProps;
  protected readonly groupBy = groupBy;
  protected readonly reducers = reducers;
  protected readonly groupColumn = groupColumn;
  protected readonly groupRowsState = groupRowsState;
  protected readonly groupOptions = groupOptions;
  protected readonly defaultColumnSizing = defaultColumnSizing;

  protected readonly groupRenderStrategy = signal<any>('single-column');

  protected readonly hideEmptyGroupColumns = signal(true);

  protected readonly columns = computed<Record<string, any>>(() => {
    return {
      department: {
        field: 'department',
        valueFormatter:
          this.groupRenderStrategy() === 'inline'
            ? ({ rowInfo }: { rowInfo: any }) => {
                if (!rowInfo.isGroupRow) {
                  return null;
                }
                const { groupBy, parents } = rowInfo;

                const indexOfDepartment =
                  groupBy?.findIndex((g: any) => g.field === 'department') ??
                  -1;
                const groupData = parents?.[indexOfDepartment] || rowInfo;

                return `${groupData?.value} (${
                  groupData?.groupCount
                }), total ${' '} ${formatter.format(
                  groupData?.reducerResults?.salary as any as number,
                )}`;
              }
            : undefined,
      },
      team: {
        field: 'team',
      },
      id: { field: 'id' },
      name: { field: 'name' },
      country: { field: 'country' },

      salary: {
        field: 'salary',

        render: ({ value }: { value: any }) =>
          value ? `$ ${formatter.format(value as any as number)}` : null,
      },
    };
  });

  protected onStrategyChange(event: Event) {
    const value = (event.target as HTMLInputElement).value as any;
    this.groupRenderStrategy.set(value);

    this.hideEmptyGroupColumns.set(
      value === 'single-column' ? false : this.hideEmptyGroupColumns(),
    );
  }

  protected toggleHide() {
    this.hideEmptyGroupColumns.set(!this.hideEmptyGroupColumns());
  }
}
