import { Component, signal } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';



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

const dataSource = ({ filterValue, sortInfo }: any) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  const args = [
    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ filter, field }: any) => {
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args)
    .then((r) => r.json())
    .then((data) => {
      return new Promise<any>((resolve) => {
        data.totalCountUnfiltered = 100;
        resolve(data);
      });
    });
};

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }: { data: Developer | null }) => {
      return `${data?.firstName} - ${data?.lastName}`;
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
  country: {
    field: 'country',
  },
};

const domProps = {
  style: {
    margin: '5px',
    // so all 100 rows are displayed, and not virtualized
    height: '5000px',
    flex: 'none',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const filterValue = signal<any>(undefined);

const setStack = () => {
  filterValue.set([
    {
      field: 'stack',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'frontend',
      },
    },
  ]);
};

const setCountry = () => {
  filterValue.set([
    {
      field: 'country',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'United States',
      },
    },
  ]);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <h2>Current filter value:</h2>
  <button data-name="none" (click)="filterValue.set(undefined)">
    Clear filter
  </button>
  <button data-name="stack" (click)="setStack()">Filter by stack=frontend</button>
  <button data-name="country" (click)="setCountry()">
    Filter by country=United States
  </button>

  <infinite-data-source
    [data]="dataSource"
    primaryKey="id"
    [filterValue]="filterValue()"
    [shouldReloadData]="{ filterValue: true }"
  >
    <infinite-table
      [showColumnFilters]="true"
      [domProps]="domProps"
      [columnDefaultWidth]="150"
      [columns]="columns"
    />
  </infinite-data-source>
  `,
})
export default class ServerSidePage {
  protected readonly setCountry = setCountry;
  protected readonly setStack = setStack;
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly filterValue = filterValue;
}
