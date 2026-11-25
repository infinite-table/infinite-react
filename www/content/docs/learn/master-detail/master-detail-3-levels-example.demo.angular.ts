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
    renderRowDetailIcon: true,
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
  styles: `
    .detail {
      padding: 10px;
      color: var(--infinite-cell-color);
      background: var(--infinite-background);
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `,
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
        debugId="master-detail-3-levels-example-2"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [defaultRowDetailState]="defaultRowDetailState"
        [columnMinWidth]="50"
        [columns]="masterColumns"
        [rowDetailHeight]="350"
        [rowDetailRenderer]="renderDetail"
      />
    </infinite-data-source>

    <!-- #highlight second level: the developers of the city, a DataGrid with row details of its own -->
    <ng-template #detail let-rowInfo>
      <div class="detail">
        <h3>Developers in {{ rowInfo.data?.name }}, {{ rowInfo.data?.country }}</h3>

        <infinite-data-source
          [data]="detailDataSource"
          primaryKey="id"
          [shouldReloadData]="shouldReloadData"
        >
          <infinite-table
            debugId="master-detail-3-levels-example"
            [columnDefaultWidth]="150"
            [columnMinWidth]="50"
            [columns]="detailColumns"
            [rowDetailHeight]="200"
            [rowDetailRenderer]="renderLastDetail"
          />
        </infinite-data-source>
      </div>
    </ng-template>
    <!-- #endhighlight -->

    <!-- third level: the details of a developer -->
    <ng-template #lastDetail let-rowInfo>
      @if (rowInfo.data; as data) {
        <div class="detail">
          <h3>Developer: {{ data.firstName }} {{ data.lastName }}</h3>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px">
            <div>Preferred Language</div>
            <div>{{ data.preferredLanguage }}</div>

            <div>Salary</div>
            <div>{{ data.salary }}</div>

            <div>Currency</div>
            <div>{{ data.currency }}</div>

            <div>Can Design</div>
            <div>{{ data.canDesign }}</div>
          </div>
        </div>
      } @else {
        <div>No data ...</div>
      }
    </ng-template>
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
  private readonly lastDetailTemplate =
    viewChild.required<TemplateRef<unknown>>('lastDetail');

  // fields, so the grids get the same functions every time
  protected readonly renderDetail = () => this.detailTemplate();
  protected readonly renderLastDetail = () => this.lastDetailTemplate();
}
