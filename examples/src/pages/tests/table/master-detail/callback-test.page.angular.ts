import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectMasterRowInfo,
  type DataSourceProps,
  type InfiniteTablePropColumns,
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
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },

  firstName: { field: 'firstName', renderRowDetailIcon: true },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
  },

  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const detailDataSource: DataSourceProps<Developer>['data'] = ({
  sortInfo,
  filterValue,
  masterRowInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  console.log(masterRowInfo?.data, 'master');

  const args = [
    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }) => {
            return {
              field: field,
              value: filter.value,
              operator: filter.operator,
            };
          }),
        )
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10-sql?' + args)
    .then((r) => r.json())
    .then((response: { data: Developer[] }) => {
      const { data } = response;

      return new Promise<Developer[]>((resolve) => {
        setTimeout(() => {
          resolve(
            data.map((x) => {
              return {
                ...x,
                id: `000${x.id}` as any as number,
              } as Developer;
            }),
          );
        }, 1000);
      });
    });
};

const detailCols: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: { field: 'salary' },
  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
};

/**
 * The details of a row: a form and a nested DataSource + InfiniteTable,
 * whose data function gets the master row info.
 */
@Component({
  selector: 'row-detail',
  imports: [DataSource, InfiniteTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rowInfo(); as rowInfo) {
    <div
      style="background: tomato; padding: 20px; height: 100%; display: flex; flex-flow: column"
    >
      <form style="padding: 20px">
        <label>
          First name:
          <input name="first name" [value]="rowInfo.data?.firstName" />
        </label>
        <label>
          Age:
          <input name="last name" type="number" [value]="rowInfo.data?.age" />
        </label>
      </form>
      <infinite-data-source
        [debugId]="'datasource-detail-' + rowInfo.id"
        [data]="detailDataSource"
        [shouldReloadData]="shouldReloadData"
        primaryKey="id"
        [defaultGroupBy]="defaultGroupBy"
        [defaultFilterValue]="[]"
      >
        <infinite-table
          [debugId]="'infinite-detail-' + rowInfo.id"
          [domProps]="detailsDOMProps"
          [columns]="detailCols"
        />
      </infinite-data-source>
    </div>
    }
  `,
})
class RowDetail {
  protected readonly rowInfo = injectMasterRowInfo<Developer>();

  protected readonly detailDataSource = detailDataSource;
  protected readonly detailCols = detailCols;
  protected readonly shouldReloadData = { sortInfo: true, filterValue: true };
  protected readonly defaultGroupBy = [{ field: 'stack' as const }];
  protected readonly detailsDOMProps = { style: { flex: 1 } };
}

@Component({
  selector: 'test-page',
  imports: [DataSource, InfiniteTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="root-infinite"
        [columnDefaultWidth]="130"
        [rowHeight]="50"
        [defaultRowDetailState]="defaultRowDetailState"
        [rowDetailCache]="false"
        [onRowDetailStateChange]="onRowDetailStateChange"
        [components]="components"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class CallbackTestPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly components = { RowDetail };

  protected readonly defaultRowDetailState = {
    expandedRows: [1, 2],
    collapsedRows: true as const,
  };

  protected readonly onRowDetailStateChange = (
    _rowDetailState: unknown,
    rowDetails: unknown,
  ) => {
    (globalThis as any).lastRowDetails = rowDetails;
  };

  // the React page's CustomRowHeight class only sets --row-height, which
  // rowHeight (a number) doesn't read
  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '80vh',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
