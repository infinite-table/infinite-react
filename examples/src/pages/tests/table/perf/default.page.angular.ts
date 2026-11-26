import {
  Component,
  TemplateRef,
  computed,
  signal,
  viewChild,
} from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  renderTemplate,
} from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

interface DataItem {
  id: string;
  [key: string]: string;
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const COL_DEFAULT_WIDTH = 150;

type ColumnRender = NonNullable<InfiniteTableColumn<DataItem>['render']>;
type RenderCell = (
  i: number,
  param: Parameters<ColumnRender>[0],
) => ReturnType<ColumnRender>;

const getColumns = (count: number, renderCell: RenderCell) => {
  const columns: Record<string, InfiniteTableColumn<DataItem>> = {};
  let i = 0;
  while (Object.keys(columns).length < count) {
    const time = Math.floor(i / alphabet.length);
    const index = i % alphabet.length;
    const colName = alphabet[index] + (time + 1);
    const column: InfiniteTableColumn<DataItem> = {
      field: colName,
      // defaultWidth: Math.max(COL_DEFAULT_WIDTH + index, 40),
      render: renderCell.bind(null, i),
    };
    columns[colName] = column;
    i++;
  }
  return columns;
};

const btn = `border-1 border-gray-300 rounded px-2 py-1`;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="height: 100%">
      <button [class]="btn" (click)="expanded.set(!expanded())">
        Toggle configuration
      </button>
      <div [style.display]="expanded() ? 'block' : 'none'">
        <div style="display: flex; flex-flow: row">
          @for (count of columnCounts; track count) {
            <button [class]="btn" (click)="columnCount.set(count)">
              {{ count }} cols
            </button>
          }
        </div>
        <div style="display: flex; flex-flow: row">
          @for (count of rowCounts; track count.value) {
            <button [class]="btn" (click)="dataSourceCount.set(count.value)">
              {{ count.label }} rows
            </button>
          }
        </div>
        <div style="display: flex; flex-flow: row">
          @for (h of heights; track h) {
            <button [class]="btn" (click)="height.set(h)">height={{ h }}</button>
          }
        </div>
        <div style="display: flex; flex-flow: row">
          @for (h of rowHeights; track h) {
            <button [class]="btn" (click)="rowHeight.set(h)">
              rowHeight={{ h }}
            </button>
          }
        </div>
        <p>
          {{ dataSourceCount() }} rows, {{ columnCount() }} columns, row height
          {{ rowHeight() }}
        </p>
      </div>
      <infinite-data-source [data]="dataSource()" primaryKey="id">
        <!-- React remounts the grid when rowHeight changes (key={rowHeight}) -->
        @for (h of [rowHeight()]; track h) {
          <infinite-table
            [header]="false"
            [domProps]="domProps()"
            [rowHeight]="h"
            [columnDefaultWidth]="COL_DEFAULT_WIDTH"
            [columnMinWidth]="40"
            [columns]="columns()"
          />
        }
      </infinite-data-source>
    </div>

    <ng-template #cell let-rowIndex="rowIndex" let-field="field" let-i="i">
      <span>Row {{ rowIndex }}, col {{ field }} = {{ i }}</span>
    </ng-template>
  `,
})
export default class PerfDefaultPage {
  protected readonly btn = btn;
  protected readonly COL_DEFAULT_WIDTH = COL_DEFAULT_WIDTH;

  protected readonly columnCounts = [10, 20, 30, 50, 100, 150];
  protected readonly rowCounts = [
    { value: 100, label: '100' },
    { value: 1000, label: '1000' },
    { value: 10000, label: '10k' },
    { value: 100000, label: '100k' },
  ];
  protected readonly heights: (number | string)[] = [
    300,
    200,
    '60vh',
    '80vh',
    '90vh',
  ];
  protected readonly rowHeights = [30, 40, 50, 70, 100];

  protected readonly columnCount = signal(150);
  protected readonly rowHeight = signal(40);
  protected readonly height = signal<number | string | null>(null);
  protected readonly dataSourceCount = signal(100);
  protected readonly expanded = signal(true);

  private readonly cell = viewChild.required<TemplateRef<unknown>>('cell');

  protected readonly columns = computed(() =>
    getColumns(this.columnCount(), (i, { rowIndex, column }) =>
      renderTemplate(this.cell(), { rowIndex, field: column.field, i }),
    ),
  );

  protected readonly dataSource = computed(() => {
    const columns = this.columns();
    const dataSourceCount = this.dataSourceCount();
    return Promise.resolve(
      [...Array(dataSourceCount)].map((_x, rowIndex) => {
        const result = Object.keys(columns).reduce(
          (acc: DataItem, key: string) => {
            const col = columns[key] as InfiniteTableColumn<DataItem>;
            acc[col.field!] = `${col.field as string}-${rowIndex}`;
            return acc;
          },
          {} as DataItem,
        );

        result.id = `id-${rowIndex}`;

        return result as DataItem;
      }),
    );
  });

  protected readonly domProps = computed(() => ({
    style: {
      margin: '5px',
      height: this.height() || '60vh',
      border: '1px solid gray',
      position: 'relative',
    },
  }));
}
