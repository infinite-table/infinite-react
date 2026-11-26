import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type {
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = () => {
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
    {
      id: 4,
      firstName: 'Nadia',
      lastName: 'Maty',
      country: 'Canada',
      city: 'Quebec',
      currency: 'CAD',
    },
    {
      id: 5,
      firstName: 'Rich',
      lastName: 'Bobyard',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 6,
      firstName: 'Hillary',
      lastName: 'Markinson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 7,
      firstName: 'Nat',
      lastName: 'Medson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
    {
      id: 8,
      firstName: 'Joseph',
      lastName: 'Maty',
      country: 'Canada',
      city: 'Quebec',
      currency: 'CAD',
    },

    {
      id: 9,
      firstName: 'Michaela',
      lastName: 'Albertson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
  ];
};

const onSelfFocus = () => {
  // console.log('onSelfFocus');
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).infiniteApi = api;
};

const domProps = {
  style: {
    margin: '10px',
    height: '150px',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div>
      <input type="text" value="John" />
    </div>
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        [columns]="columns"
        [columnDefaultWidth]="500"
        keyboardNavigation="cell"
        (selfFocus)="onSelfFocus()"
        (ready)="onReady($event)"
        [domProps]="domProps"
      />
    </infinite-data-source>
    <div>
      <input type="text" value="Patrick" />
    </div>

    <ng-template #countryInput let-rowIndex="rowIndex">
      <input name="country" type="text" [value]="rowIndex + '-country'" />
    </ng-template>
    <ng-template #currencyInput let-rowIndex="rowIndex">
      <input name="currency" type="text" [value]="rowIndex + '-currency'" />
    </ng-template>
  `,
})
export default class TabNavigationPage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly onSelfFocus = onSelfFocus;
  protected readonly onReady = onReady;

  private readonly countryInput =
    viewChild.required<TemplateRef<unknown>>('countryInput');
  private readonly currencyInput =
    viewChild.required<TemplateRef<unknown>>('currencyInput');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 380 },
    country: {
      field: 'country',
      contentFocusable: true,
      renderValue: () => this.countryInput(),
    },
    firstName: {
      field: 'firstName',
    },
    preferredLanguage: {
      field: 'currency',
      // editable: () => true,
      contentFocusable: true,
      renderValue: () => this.currencyInput(),
    },
  };
}
