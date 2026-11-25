import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
  InfiniteTableRowInfo,
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
        debugId="master-detail-example-2"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="masterColumns"
        [rowDetailRenderer]="renderDetail"
      />
    </infinite-data-source>

    <!-- #highlight the row detail: a DataSource + InfiniteTable for each expanded row -->
    <ng-template #detail>
      <infinite-data-source
        [data]="detailDataSource"
        primaryKey="id"
        [shouldReloadData]="shouldReloadData"
      >
        <infinite-table
          debugId="master-detail-example"
          [columnDefaultWidth]="150"
          [columnMinWidth]="50"
          [columns]="detailColumns"
        />
      </infinite-data-source>
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

  private readonly detailTemplate =
    viewChild.required<TemplateRef<unknown>>('detail');

  // a field, so the grid gets the same function every time
  protected readonly renderDetail = (rowInfo: InfiniteTableRowInfo<City>) => {
    console.log('rendering detail for master row', rowInfo.id);
    return this.detailTemplate();
  };
}
