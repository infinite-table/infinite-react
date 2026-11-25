import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  city: string;
  currency: string;
  country: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

type City = {
  id: number;
  name: string;
  country: string;
};

const masterColumns: InfiniteTablePropColumns<City> = {
  id: {
    field: 'id',
    header: 'ID',
    defaultWidth: 70,
    renderRowDetailIcon: true,
  },
  country: { field: 'country', header: 'Country' },
  city: { field: 'name', header: 'City', defaultFlex: 1 },
};

const detailColumns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },

  stack: { field: 'stack' },
  currency: { field: 'currency' },
  city: { field: 'city' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
const shouldReloadData = {
  sortInfo: true,
  filterValue: true,
};

const defaultRowDetailState = {
  collapsedRows: true as const,
  expandedRows: [39, 54],
};

// fetch an array of cities from the server
const citiesDataSource: DataSourceData<City> = () => {
  const cityNames = new Set<string>();
  const result: City[] = [];
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((response) => response.json())
    .then((response) => {
      response.data.forEach((data: Developer) => {
        if (cityNames.has(data.city)) {
          return;
        }
        cityNames.add(data.city);
        result.push({
          name: data.city,
          country: data.country,
          id: result.length,
        });
      });

      return result;
    });
};

const detailDataSource: DataSourceData<Developer> = ({
  filterValue,
  sortInfo,
  masterRowInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  if (!filterValue) {
    filterValue = [];
  }
  if (masterRowInfo) {
    // filter by master country and city
    filterValue = [
      {
        field: 'city',
        filter: {
          operator: 'eq',
          type: 'string',
          value: masterRowInfo.data.name,
        },
      },
      {
        field: 'country',
        filter: {
          operator: 'eq',
          type: 'string',
          value: masterRowInfo.data.country,
        },
      },
      ...filterValue,
    ];
  }
  const args = [
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,

    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }) => {
            return {
              field: field,
              operator: filter.operator,
              value:
                filter.type === 'number' ? Number(filter.value) : filter.value,
            };
          }),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?` + args)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="citiesDataSource"
      primaryKey="id"
      [defaultSortInfo]="[
        {
          field: 'country',
          dir: 1,
        },
        {
          field: 'name',
          dir: 1,
        },
      ]"
    >
      <infinite-table
        debugId="master-detail-custom-datagrid-example-2"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [defaultRowDetailState]="defaultRowDetailState"
        [columns]="masterColumns"
        [rowDetailHeight]="320"
        [rowDetailRenderer]="renderDetail"
      />
    </infinite-data-source>

    <!-- #highlight the row detail: custom content and a DataGrid -->
    <ng-template #detail let-rowInfo>
      <div
        style="padding: 10px; color: var(--infinite-cell-color); background: var(--infinite-background); height: 100%; display: flex; flex-direction: column"
      >
        <h3>Developers in {{ rowInfo.data?.name }}, {{ rowInfo.data?.country }}</h3>

        <infinite-data-source
          [data]="detailDataSource"
          primaryKey="id"
          [shouldReloadData]="shouldReloadData"
        >
          <infinite-table
            debugId="master-detail-custom-datagrid-example"
            [columnDefaultWidth]="150"
            [columnMinWidth]="50"
            [columns]="detailColumns"
          />
        </infinite-data-source>
      </div>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly citiesDataSource = citiesDataSource;
  protected readonly detailDataSource = detailDataSource;
  protected readonly masterColumns = masterColumns;
  protected readonly detailColumns = detailColumns;
  protected readonly domProps = domProps;
  protected readonly shouldReloadData = shouldReloadData;
  protected readonly defaultRowDetailState = defaultRowDetailState;

  private readonly detailTemplate =
    viewChild.required<TemplateRef<unknown>>('detail');

  // a field, so the grid gets the same function every time
  // the template gets the row info as its context (let-rowInfo)
  protected readonly renderDetail = () => this.detailTemplate();
}
