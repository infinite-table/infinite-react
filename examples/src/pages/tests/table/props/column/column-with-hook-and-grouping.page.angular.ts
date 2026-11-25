import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Bobson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 2,
      firstName: 'Bill',
      lastName: 'Richardson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 3,
      firstName: 'Nat',
      lastName: 'Natson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
  ];
};

const defaultGroupRowsState = {
  expandedRows: true as const,
  collapsedRows: [],
};

@Component({
  imports: [DataSource, InfiniteTable, InfiniteRender],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [defaultGroupRowsState]="defaultGroupRowsState"
      [groupBy]="groupBy"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="180"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>

    <ng-template #valueButton let-renderBag="renderBag">
      <button><ng-container [infiniteRender]="renderBag.value" /></button>
    </ng-template>
    <ng-template #groupIconButton let-renderBag="renderBag">
      <button><ng-container [infiniteRender]="renderBag.groupIcon" /></button>
    </ng-template>
  `,
})
export default class ColumnWithHookAndGroupingPage {
  protected readonly dataSource = dataSource;
  protected readonly defaultGroupRowsState = defaultGroupRowsState;

  private readonly valueButton =
    viewChild.required<TemplateRef<unknown>>('valueButton');
  private readonly groupIconButton =
    viewChild.required<TemplateRef<unknown>>('groupIconButton');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    firstName: {
      field: 'firstName',
      defaultWidth: 200,
    },
    city: {
      field: 'city',
    },

    currency: {
      field: 'currency',
      renderGroupValue: ({ rowInfo }: any) => {
        return rowInfo.value;
      },
    },
    country: {
      field: 'country',
      renderGroupValue: ({ rowInfo }: any) => {
        return `Group: ${rowInfo.value}`;
      },
      renderLeafValue: ({ value }: any) => {
        return `Country: ${value}`;
      },
      render: () => {
        return this.valueButton();
      },
    },
  };

  protected readonly groupBy = [
    {
      field: 'country' as const,
      column: {
        renderGroupIcon: () => {
          return this.groupIconButton();
        },
      },
    },
  ];

  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '500px',
      width: '1000px',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
