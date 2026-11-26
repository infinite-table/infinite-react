import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceGroupBy,
  DataSourcePivotBy,
  DataSourcePropAggregationReducers,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  {
    field: 'city',
  },
];

const defaultPivotBy: DataSourcePivotBy<Developer>[] = [
  {
    field: 'stack',
  },
  {
    field: 'canDesign',
    columnGroup: ({ columnGroup }) => {
      return {
        ...columnGroup,
        header:
          columnGroup.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      };
    },
  },
];

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,

  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => Math.round(arr.length ? sum / arr.length : 0),
};

const aggregations: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    ...avgReducer,
    name: 'Salary (avg)',
    field: 'salary',
  },
  age: {
    ...avgReducer,
    name: 'Age (avg)',
    field: 'age',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #highlight the DataSource computes the pivot columns, the grid shows them -->
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [defaultGroupBy]="defaultGroupBy"
      [defaultPivotBy]="defaultPivotBy"
      [aggregationReducers]="aggregations"
      [data]="dataSource"
    >
      <infinite-table
        debugId="pivot-grand-total-column-position-example"
        groupRenderStrategy="single-column"
        [columns]="columns"
        [columnDefaultWidth]="200"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
        pivotTotalColumnPosition="end"
        pivotGrandTotalColumnPosition="start"
      />
    </infinite-data-source>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly defaultPivotBy = defaultPivotBy;
  protected readonly aggregations = aggregations;
}
