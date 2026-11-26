import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  RowSelectionState,
} from '@infinite-table/infinite-angular';

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  checkbox: {
    defaultWidth: 140,
    align: 'center',
    resizable: false,

    style: {
      cursor: 'pointer',
    },

    renderSelectionCheckBox: true,
  },
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
    align: 'end',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
    renderSelectionCheckBox: true,

    defaultWidth: 200,
  },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const defaultGroupBy = [
  {
    field: 'stack' as const,
    column: {
      renderSelectionCheckBox: true,
    },
  },
  {
    field: 'country' as const,
  },
];

const groupColumn = {
  field: 'firstName' as const,
  defaultWidth: 200,
};

const onRowSelectionChange = (rowSelection: any) => {
  console.log(JSON.stringify(rowSelection, null, 2));
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div>Selected {{ selectedCount(rowSelection()) }}</div>
    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      selectionMode="multi-row"
      [defaultGroupBy]="defaultGroupBy"
      [defaultRowSelection]="rowSelection()"
      (rowSelectionChange)="onRowSelectionChange($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        groupRenderStrategy="single-column"
        [columns]="columns"
        [columnDefaultWidth]="100"
      />
    </infinite-data-source>
  `,
})
export default class CheckboxWithGroupingAndAggPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly groupColumn = groupColumn;
  protected readonly onRowSelectionChange = onRowSelectionChange;

  protected readonly rowSelection = signal<any>({
    selectedRows: [2, 3],
    defaultSelection: false,
  });

  protected selectedCount(sel: any) {
    return sel instanceof RowSelectionState ? sel.getSelectedCount() : false;
  }
}
