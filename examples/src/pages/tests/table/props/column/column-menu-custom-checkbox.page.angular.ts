import { Component, input } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';



import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = () => {
  return [
    { id: 1, firstName: 'John', country: 'USA', currency: 'USD' },
    { id: 2, firstName: 'Bill', country: 'USA', currency: 'USD' },
    { id: 3, firstName: 'Nat', country: 'Canada', currency: 'CAD' },
  ];
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  currency: { field: 'currency' },
};

/**
 * The components.CheckBox contract: checked / disabled / onChange inputs.
 */
@Component({
  selector: 'input[customCheckBox]',
  host: {
    type: 'checkbox',
    'data-name': 'custom-checkbox',
    '[checked]': '!!checked()',
    '[disabled]': '!!disabled()',
    '(change)': 'onInputChange($event)',
  },
  template: '',
})
class CustomCheckBox {
  readonly checked = input<boolean | null>(null);
  readonly disabled = input<boolean>(false);
  readonly onChange = input<(checked: boolean) => void>();

  protected onInputChange(event: Event) {
    this.onChange()?.((event.target as HTMLInputElement).checked);
  }
}

const components = {
  CheckBox: CustomCheckBox as any,
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <infinite-data-source primaryKey="id" [data]="dataSource">
    <infinite-table
      [domProps]="domProps"
      [columnDefaultWidth]="140"
      [columns]="columns"
      [components]="components"
    />
  </infinite-data-source>
  `,
})
export default class ColumnMenuCustomCheckboxPage {
  protected readonly columns = columns;
  protected readonly components = components;
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
}
