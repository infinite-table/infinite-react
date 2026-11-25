import { Component, computed } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  injectColumnCell,
  injectColumnCellChildren,
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

// TODO: the components.HeaderCell override of the React/Vue page (the
// column field + a custom sort tool), once header cell overrides are
// supported in Angular

// the cell override: its host element is the cell
@Component({
  selector: 'div[countryCell]',
  imports: [InfiniteRender],
  host: { '[style]': 'style()' },
  // we want to make sure the value in the renderBag is correctly used
  template: `<ng-container [infiniteRender]="children()" />!<ng-container
      [infiniteRender]="cell().renderBag.value"
    />!{{ emoji() }}
    <div style="flex: 1"></div>`,
})
class CountryCell {
  protected readonly cell = injectColumnCell<Developer>();
  protected readonly children = injectColumnCellChildren();

  private readonly isUSA = computed(() => this.cell().value === 'USA');

  protected readonly emoji = computed(() =>
    this.isUSA() ? '- UNITED STATES' : '- CANADA',
  );

  protected readonly style = computed(() => ({
    padding: '5px 20px',
    border: `1px solid ${this.isUSA() ? 'red' : 'green'}`,
  }));
}

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        [columns]="columns"
        [columnDefaultWidth]="500"
        [domProps]="domProps"
      />
    </infinite-data-source>
  `,
})
export default class ColumnComponentsPage {
  protected readonly dataSource = dataSource;
  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    country: {
      field: 'country',
      renderValue: ({ data }) => 'Country: ' + data?.country,
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
  protected readonly domProps = {
    style: {
      height: '500px',
    },
  };
}
