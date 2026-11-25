import { Component } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
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

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  country: {
    field: 'country',
    header: 'Your country of residence',
    renderValue: ({ data }) => 'Country: ' + data?.country,
    align: 'center',
    defaultWidth: 500,
  },
  firstName: {
    field: 'firstName',
    header: 'First Name',
    align: 'end',
    defaultSortable: false,
    defaultFlex: 1,
  },
  preferredLanguage: {
    field: 'currency',

    defaultFlex: 1,
  },
};

const getColumnMenuItems = (items: any[], { columnApi }: { columnApi: any }) => {
  items.push('-');
  items.push({
    key: 'close',
    label: 'Close',
    onClick: () => {
      columnApi.hideContextMenu();
    },
  });
  return items;
};

const getCellContextMenuItems = (_params: any, { api }: { api: any }) => {
  return [
    {
      key: 'close',
      label: 'Close',
      onClick: () => {
        api.hideContextMenu();
      },
    },
  ];
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
      [columnMinWidth]="50"
      [columns]="columns"
      [getColumnMenuItems]="getColumnMenuItems"
      [getCellContextMenuItems]="getCellContextMenuItems"
    />
  </infinite-data-source>
  `,
})
export default class ColumnContextMenuPage {
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly getCellContextMenuItems = getCellContextMenuItems;
  protected readonly getColumnMenuItems = getColumnMenuItems;
}
