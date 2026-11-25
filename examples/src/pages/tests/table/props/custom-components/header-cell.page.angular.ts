import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  injectColumnCell,
  injectHeaderCellChildren,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

// the overrides' host elements are the cell roots (the grid applies the
// class names, styles and data attributes to them)
@Component({
  selector: 'div[headerCellFirstName]',
  imports: [InfiniteRender],
  host: {
    'data-name': 'header-cell-firstName',
    '[style.background-color]': "'red'",
  },
  template: `<ng-container [infiniteRender]="children()" />!`,
})
class HeaderCell {
  protected readonly children = injectHeaderCellChildren();
}

// TODO once the cell root overrides land (injectColumnCellChildren on
// angular/editing): render the default children, like the Vue page
@Component({
  selector: 'div[columnCellFirstName]',
  imports: [InfiniteRender],
  host: { 'data-name': 'column-cell-firstName' },
  template: `<ng-container [infiniteRender]="cell().renderBag.value" />!`,
})
class ColumnCell {
  protected readonly cell = injectColumnCell();
}

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    components: {
      HeaderCell: HeaderCell as any,
      ColumnCell: ColumnCell as any,
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const dataSource = () => {
  return Promise.resolve(data.slice(0, 1));
};

const domProps = {
  style: {
    minHeight: '500px',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table [columns]="tableColumns" [domProps]="domProps" />
    </infinite-data-source>
  `,
})
export default class HeaderCellPage {
  protected readonly dataSource = dataSource;
  protected readonly tableColumns = { firstName: columns.firstName };
  protected readonly domProps = domProps;
}
