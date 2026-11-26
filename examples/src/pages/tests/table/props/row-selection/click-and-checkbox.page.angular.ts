import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  name: string;
  language: string;
  level: string;
};

// grouped by language, the rows are:
// TypeScript (1, 2, 3), Go (4, 5), Rust (6, 7, 8)
// and grouped by language and level:
// TypeScript (junior: 1, senior: 2, 3), Go (junior: 4, senior: 5),
// Rust (junior: 6, 7, senior: 8)
const data: Developer[] = [
  { id: 1, name: 'TS 1', language: 'TypeScript', level: 'junior' },
  { id: 2, name: 'TS 2', language: 'TypeScript', level: 'senior' },
  { id: 3, name: 'TS 3', language: 'TypeScript', level: 'senior' },
  { id: 4, name: 'Go 1', language: 'Go', level: 'junior' },
  { id: 5, name: 'Go 2', language: 'Go', level: 'senior' },
  { id: 6, name: 'Rust 1', language: 'Rust', level: 'junior' },
  { id: 7, name: 'Rust 2', language: 'Rust', level: 'junior' },
  { id: 8, name: 'Rust 3', language: 'Rust', level: 'senior' },
];

const domProps = { style: { height: '80vh' } };
const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'language' }];
const nestedGroupBy: DataSourcePropGroupBy<Developer> = [
  { field: 'language' },
  { field: 'level' },
];
const noGroupBy: DataSourcePropGroupBy<Developer> = [];

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 4px">
      <button data-name="group" (click)="grouped.set('language')">group</button>
      <button data-name="group-nested" (click)="grouped.set('nested')">
        group-nested
      </button>
      <button data-name="ungroup" (click)="grouped.set(false)">ungroup</button>
      <button data-name="checkbox-column-on" (click)="checkboxColumn.set(true)">
        checkbox-column-on
      </button>
      <button data-name="checkbox-column-off" (click)="checkboxColumn.set(false)">
        checkbox-column-off
      </button>
      <button
        data-name="group-column-checkbox-on"
        (click)="groupColumnCheckbox.set(true)"
      >
        group-column-checkbox-on
      </button>
      <button
        data-name="group-column-checkbox-off"
        (click)="groupColumnCheckbox.set(false)"
      >
        group-column-checkbox-off
      </button>
      <button data-name="select-with-click" (click)="selectWith.set('click')">
        select-with-click
      </button>
      <button data-name="select-with-checkbox" (click)="selectWith.set('checkbox')">
        select-with-checkbox
      </button>
      <button data-name="collapse-go" (click)="collapseGroupRow(['Go'])">
        collapse-go
      </button>
      <button
        data-name="collapse-ts-senior"
        (click)="collapseGroupRow(['TypeScript', 'senior'])"
      >
        collapse-ts-senior
      </button>
      <button data-name="clear-selection" (click)="clearSelection()">
        clear-selection
      </button>
    </div>
    <pre data-name="selection-config">{{ config() }}</pre>
    <pre data-name="selected-ids">{{ selectedIdsText() }}</pre>
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [groupBy]="currentGroupBy()"
      selectionMode="multi-row"
      [rowSelection]="rowSelection()"
      (rowSelectionChange)="onRowSelectionChange($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns()"
        [groupColumn]="groupColumn()"
        groupRenderStrategy="single-column"
        [multiRowSelectionWith]="selectWith()"
        (ready)="onReady($event)"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class ClickAndCheckboxPage {
  protected readonly data = data;
  protected readonly domProps = domProps;

  protected readonly grouped = signal<false | 'language' | 'nested'>(false);
  protected readonly checkboxColumn = signal(false);
  protected readonly groupColumnCheckbox = signal(false);
  protected readonly selectWith = signal<'click' | 'checkbox'>('checkbox');
  protected readonly rowSelection = signal<any>({
    selectedRows: [],
    defaultSelection: false,
  });
  protected readonly selectedIds = signal<any[]>([]);

  private api: any = null;

  protected readonly currentGroupBy = computed(() => {
    const grouped = this.grouped();
    return grouped === 'nested' ? nestedGroupBy : grouped ? groupBy : noGroupBy;
  });

  protected readonly columns = computed(() => {
    const columns: Record<string, any> = {};
    if (this.checkboxColumn()) {
      columns['selection'] = {
        renderValue: () => null,
        renderSelectionCheckBox: true,
        defaultWidth: 60,
      };
    }
    columns['name'] = { field: 'name' };
    columns['language'] = { field: 'language' };
    return columns;
  });

  protected readonly groupColumn = computed(() => ({
    renderSelectionCheckBox: this.groupColumnCheckbox(),
  }));

  protected readonly config = computed(() =>
    JSON.stringify({
      grouped: this.grouped(),
      checkboxColumn: this.checkboxColumn(),
      groupColumnCheckbox: this.groupColumnCheckbox(),
      selectWith: this.selectWith(),
    }),
  );

  protected readonly selectedIdsText = computed(() =>
    JSON.stringify(this.selectedIds()),
  );

  protected onReady(param: any) {
    this.api = param.api;
    (globalThis as any).INFINITE_GRID_API = this.api;
  }

  protected onRowSelectionChange(sel: any) {
    this.rowSelection.set(sel);
    this.selectedIds.set(
      this.api
        ? this.api.rowSelectionApi
            .getSelectedPrimaryKeys(sel)
            .slice()
            .sort((a: number, b: number) => a - b)
        : [],
    );
  }

  protected collapseGroupRow(keys: any[]) {
    this.api?.collapseGroupRow(keys);
  }

  protected clearSelection() {
    this.rowSelection.set({ selectedRows: [], defaultSelection: false });
    this.selectedIds.set([]);
  }
}
