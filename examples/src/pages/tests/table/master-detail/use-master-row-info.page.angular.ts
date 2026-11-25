import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectDataSource,
  injectHeaderCell,
  injectMasterRowInfo,
  renderComponent,
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

// the header of the column: the column id and the length of the data array
// of the closest DataSource (the master or the detail one)
@Component({
  selector: 'header-with-count',
  template: `<div>{{ text() }}</div>`,
})
class HeaderWithCount {
  private readonly dataSource = injectDataSource<Developer>();
  private readonly headerCell = injectHeaderCell<Developer>();

  protected readonly text = computed(() => {
    const length = this.dataSource.state().dataArray.length;
    const { column } = this.headerCell();
    return `${column.id} ${length}`;
  });
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    renderHeader: () => {
      return renderComponent(HeaderWithCount);
    },
  },

  firstName: { field: 'firstName' },
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
    renderRowDetailIcon: true,
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

      return data.map((x) => {
        return {
          ...x,
          id: `000${x.id}` as any as number,
        } as Developer;
      });
    });
};

const detailCols: InfiniteTablePropColumns<Developer> = {
  firstNameChildColumn: {
    field: 'firstName',

    renderHeader: () => {
      return renderComponent(HeaderWithCount);
    },
  },
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
 * The details of a row: a form and a nested DataSource + InfiniteTable.
 */
@Component({
  selector: 'row-detail',
  imports: [DataSource, InfiniteTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rowInfo(); as rowInfo) {
      <div
        style="display: flex; flex-flow: column; gap: 0.5rem; padding: 20px; background: tomato; height: 100%"
      >
        <form style="display: flex; flex-flow: row; gap: 0.5rem; align-items: center">
          <label>
            First name:
            <input
              name="first name"
              style="background: white; color: black; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem"
              [value]="rowInfo.data?.firstName"
            />
          </label>
          <label>
            Age:
            <input name="last name" type="number" [value]="rowInfo.data?.age" />
          </label>
        </form>
        @for (id of [rowInfo.id]; track id) {
          <infinite-data-source
            [debugId]="'datasource-detail-' + id"
            [data]="detailDataSource"
            [shouldReloadData]="shouldReloadData"
            primaryKey="id"
            [defaultGroupBy]="defaultGroupBy"
            [defaultFilterValue]="[]"
          >
            <infinite-table
              [debugId]="'infinite-detail-' + id"
              [domProps]="detailsDOMProps"
              [columns]="detailCols"
            />
          </infinite-data-source>
        }
      </div>
    }
  `,
})
class RowDetail {
  protected readonly rowInfo = injectMasterRowInfo<Developer>();

  protected readonly detailDataSource = detailDataSource;
  protected readonly detailCols = detailCols;
  protected readonly shouldReloadData = { filterValue: true, sortInfo: true };
  protected readonly defaultGroupBy = [{ field: 'stack' as const }];
  protected readonly detailsDOMProps = { style: { flex: 1 } };
}

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="root-infinite"
        [columnDefaultWidth]="130"
        [rowHeight]="50"
        [defaultRowDetailState]="defaultRowDetailState"
        [rowDetailCache]="false"
        [components]="components"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class UseMasterRowInfoPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly components = { RowDetail };

  protected readonly defaultRowDetailState = {
    expandedRows: [1, 2],
    collapsedRows: true as const,
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
