import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  injectColumnCell,
  renderComponent,
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
  ];
};

// the cell override: its host element is the cell
@Component({
  selector: 'div[countryCell]',
  imports: [InfiniteRender],
  host: { style: 'padding: 5px 20px' },
  template: `START:<ng-container [infiniteRender]="cell().renderBag.value" />!END`,
})
class CountryCell {
  protected readonly cell = injectColumnCell<Developer>();
}

// display: contents - the text is part of the cell, as with the React and
// Vue fragments
@Component({
  selector: 'country-value',
  host: { style: 'display: contents' },
  template: `Country: {{ cell().renderBag.value }}`,
})
class Country {
  protected readonly cell = injectColumnCell<Developer>();
}

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table [columns]="columns" [domProps]="domProps" />
    </infinite-data-source>
  `,
})
export default class UseColumnCellPage {
  protected readonly dataSource = dataSource;
  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    country: {
      field: 'country',
      renderValue: () => renderComponent(Country),
      defaultWidth: 250,
      components: {
        ColumnCell: CountryCell,
      },
    },
    firstName: {
      field: 'firstName',
    },
    preferredLanguage: {
      field: 'currency',
    },
  };
  protected readonly domProps = { style: { height: '500px' } };
}
