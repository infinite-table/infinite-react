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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

const columns: Record<string, any> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
  },
  stack: {
    field: 'stack',
    defaultHiddenWhenGroupedBy: true,
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [
  { field: 'stack' },
  {
    field: 'preferredLanguage',
  },
];

const groupColumn = {
  field: 'firstName' as const,
};

const currentGroupBy = signal<any[]>(groupBy);

const ungroup = () => {
  currentGroupBy.set([]);
};

const groupAgain = () => {
  currentGroupBy.set(groupBy);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="ungroup()">ungroup</button>
    <button (click)="groupAgain()">
      group by stack and preferred language
    </button>
    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      [groupBy]="currentGroupBy()"
      selectionMode="multi-row"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        keyboardNavigation="row"
        groupRenderStrategy="single-column"
        [hideColumnWhenGrouped]="true"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class HideColumnWhenGroupedPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly groupBy = groupBy;
  protected readonly groupColumn = groupColumn;
  protected readonly currentGroupBy = currentGroupBy;
  protected readonly ungroup = ungroup;
  protected readonly groupAgain = groupAgain;
}
