import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropRowSelection_MultiRow,
  InfiniteTableApi,
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
  imports: [DataSource, InfiniteTable, JsonPipe],
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
            height: 300px;
            overflow: auto;
            border: 1px dashed currentColor;
          "
        >
          <pre> {{ rowSelection() | json }}.</pre>
        </code>
        Current selected ids: {{ selectedIds().join(', ') }}
      </div>

      <infinite-data-source
        [data]="dataSource"
        [groupBy]="defaultGroupBy"
        [(rowSelection)]="rowSelection"
        [useGroupKeysForMultiRowSelection]="true"
        primaryKey="id"
      >
        <infinite-table
          debugId="controlled-multi-row-selection-example-with-group-keys"
          (ready)="onReady($event)"
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

  private readonly api = signal<InfiniteTableApi<Developer> | null>(null);

  protected readonly rowSelection = signal<DataSourcePropRowSelection_MultiRow>(
    {
      selectedRows: [
        ['yes', 'backend', 'TypeScript'],
        ['yes', 'backend', 'Go'],
        16,
        26,
        30,
        ['yes', 'frontend'],
      ],
      deselectedRows: [4, 2],
      defaultSelection: false,
    },
  );

  // recomputed when the api is ready and on every selection change
  protected readonly selectedIds = computed(() => {
    const api = this.api();
    if (!api) {
      return [];
    }
    return api.rowSelectionApi.getSelectedPrimaryKeys(
      this.rowSelection(),
    ) as string[];
  });

  protected onReady({ api }: { api: InfiniteTableApi<Developer> }) {
    this.api.set(api);
  }
}
