import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectMasterRowInfo,
} from '@infinite-table/infinite-angular';
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

// #highlight the row detail component: injectMasterRowInfo() gives it the master row
@Component({
  selector: 'row-detail',
  imports: [DataSource, InfiniteTable],
  // laid out by the row detail element, as the grid would be
  host: { style: 'display: contents' },
  template: `
    <infinite-data-source
      [data]="detailDataSource"
      primaryKey="id"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table
        debugId="master-detail-component-example"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="detailColumns"
      />
    </infinite-data-source>
  `,
})
class RowDetail {
  private readonly rowInfo = injectMasterRowInfo<City>();

  protected readonly detailDataSource = detailDataSource;
  protected readonly detailColumns = detailColumns;
  protected readonly shouldReloadData = shouldReloadData;

  constructor() {
    console.log('rendering detail for master row', this.rowInfo()!.id);
  }
}

const components = {
  RowDetail,
};
// #endhighlight

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
        debugId="master-detail-component-example-2"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="masterColumns"
        [components]="components"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly citiesDataSource = citiesDataSource;
  protected readonly masterColumns = masterColumns;
  protected readonly domProps = domProps;
  protected readonly components = components;
}
