import { Component, input } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

type Row = {
  id: number;
  region: string;
  label: string;
  segment: string;
  amount: number;
};

const data: Row[] = [
  { id: 1, region: 'NA', label: 'Acme', segment: 'SMB', amount: 10 },
  { id: 2, region: 'NA', label: 'Globex', segment: 'Enterprise', amount: 20 },
  { id: 3, region: 'EMEA', label: 'Acme', segment: 'SMB', amount: 30 },
  { id: 4, region: 'LATAM', label: 'Acme', segment: 'SMB', amount: 5 },
  { id: 5, region: 'LATAM', label: 'Acme', segment: 'Enterprise', amount: 6 },
];

const columns: Record<string, any> = {
  id: { field: 'id' },
  region: { field: 'region' },
  label: { field: 'label' },
  segment: { field: 'segment' },
  amount: { field: 'amount', type: 'number' },
};

const sumReducer = {
  initialValue: 0,
  reducer: (acc: number, value: number) => acc + value,
};

const reducers = {
  amount: {
    ...sumReducer,
    name: 'Amount',
    field: 'amount' as const,
  },
};

const groupBy = [
  { field: 'region' as const, column: { field: 'segment' as const } },
  { field: 'label' as const },
];
const pivotBy = [{ field: 'segment' as const }];

const domProps = {
  style: {
    height: '80vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="data"
      [groupBy]="groupBy"
      [pivotBy]="pivotBy"
      [aggregationReducers]="reducers"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [groupRenderStrategy]="groupRenderStrategy()"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
      />
    </infinite-data-source>
  `,
})
export default class PivotGroupColumnBoundPivotFieldPage {
  readonly groupRenderStrategy = input<
    'single-column' | 'multi-column' | 'inline' | undefined
  >(undefined);

  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly reducers = reducers;
  protected readonly groupBy = groupBy;
  protected readonly pivotBy = pivotBy;
  protected readonly domProps = domProps;
}
