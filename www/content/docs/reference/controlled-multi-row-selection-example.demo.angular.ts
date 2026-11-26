import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropRowSelection_MultiRow,
  InfiniteTableColumn,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
    renderGroupValue: ({ value }) => `Stack: ${value || ''}`,
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
    renderGroupValue: ({ value }) => `Lang: ${value || ''}`,
  },
  canDesign: {
    field: 'canDesign',
    renderGroupValue: ({ value }) => `Can design: ${value || ''}`,
  },
};

const defaultGroupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'canDesign',
  },
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const groupColumn: InfiniteTableColumn<Developer> = {
  field: 'firstName',
  renderSelectionCheckBox: true,
  defaultWidth: 300,
};

const domProps = {
  style: {
    flex: 1,
    minHeight: 500,
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="
        display: flex;
        flex: 1;
        overflow: auto;
        color: var(--infinite-cell-color);
        flex-flow: column;
        background: var(--infinite-background);
      "
    >
      <div style="padding: 10px">
        Current row selection:
        <code
          style="
            display: block;
            height: 100px;
            overflow: auto;
            border: 1px dashed currentColor;
          "
        >
          <pre> {{ rowSelectionJSON() }}.</pre>
        </code>
      </div>

      <infinite-data-source
        [data]="dataSource"
        [groupBy]="defaultGroupBy"
        [(rowSelection)]="rowSelection"
        primaryKey="id"
      >
        <infinite-table
          debugId="controlled-multi-row-selection-example"
          [columns]="columns"
          [domProps]="domProps"
          [groupColumn]="groupColumn"
          [columnDefaultWidth]="150"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly groupColumn = groupColumn;
  protected readonly domProps = domProps;

  // #highlight controlled: two-way bound, the grid writes the user's selection back
  protected readonly rowSelection = signal<DataSourcePropRowSelection_MultiRow>(
    {
      selectedRows: [0, 8, 10],
      defaultSelection: false,
    },
  );
  // #endhighlight

  protected readonly rowSelectionJSON = computed(() =>
    JSON.stringify(this.rowSelection()),
  );
}
