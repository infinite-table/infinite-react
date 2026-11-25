import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  createFlashingColumnCellComponent,
} from '@infinite-table/infinite-angular';

import { formatNumber, instruments, tickInstrument } from './themeDemoData';

const FlashingCell = createFlashingColumnCellComponent({ flashDuration: 800 });

const numberColumn = (
  field: string,
  header: string,
  decimals = 2,
  flashing = false,
) => ({
  field,
  header,
  type: 'number',
  defaultWidth: 110,
  renderValue: ({ value }: { value: any }) => formatNumber(value, decimals),
  ...(flashing ? { components: { ColumnCell: FlashingCell } } : {}),
});

const columns: Record<string, any> = {
  rowNumber: {
    header: '',
    defaultWidth: 48,
    align: 'center',
    defaultSortable: false,
    renderValue: ({ rowInfo }: { rowInfo: any }) =>
      rowInfo.isGroupRow ? '' : `${rowInfo.indexInAll + 1}`,
  },
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
  name: { field: 'name', header: 'Name', defaultWidth: 170 },
  price: numberColumn('price', 'Price', 2, true),
  change: numberColumn('change', 'Chg', 2, true),
  bid: numberColumn('bid', 'Bid', 2, true),
  ask: numberColumn('ask', 'Ask', 2, true),
  volume: numberColumn('volume', 'Volume', 0),
  position: numberColumn('position', 'Position', 0),
  pnl: numberColumn('pnl', 'P&L', 0),
};

const groupBy: any[] = [{ field: 'sector' }];
const defaultSortInfo: any[] = [{ field: 'symbol', dir: 1 }];
const defaultRowSelection = {
  selectedRows: [5, 10, 4],
  defaultSelection: false as const,
};
const defaultColumnPinning = { rowNumber: 'start' as const };
const defaultActiveCellIndex: [number, number] = [2, 4];
const domProps = { style: { flex: 1, minHeight: 0 } };

/**
 * The theme demo of the theme test pages (paper, sheet, terminal): the
 * Angular sibling of ThemeDemo.vue.
 */
@Component({
  selector: 'theme-demo',
  imports: [DataSource, InfiniteTable],
  host: { style: 'display: contents' },
  template: `
    <div [class]="'infinite-theme-mode--' + mode()">
      <div
        id="theme-demo"
        [class]="themeClassName()"
        style="
          display: flex;
          flex-flow: column;
          height: 100vh;
          background: var(--infinite-background);
          color: var(--infinite-color);
        "
      >
        <div style="display: flex; gap: 8px; padding: 8px; align-items: center">
          <button
            data-name="mode"
            (click)="mode.set(mode() === 'light' ? 'dark' : 'light')"
          >
            {{ mode() }}
          </button>
          <select
            data-name="density"
            title="density"
            [value]="density()"
            (change)="density.set($any($event.target).value)"
          >
            <option value="">default density</option>
            <option value="compact">compact</option>
            <option value="comfortable">comfortable</option>
            <option value="spacious">spacious</option>
          </select>
          <label>
            <input
              data-name="ticking"
              type="checkbox"
              [checked]="ticking()"
              (change)="ticking.set($any($event.target).checked)"
            />
            ticking
          </label>
        </div>
        <infinite-data-source
          [data]="instruments"
          primaryKey="id"
          [groupBy]="groupBy"
          (ready)="onReady($event)"
          [defaultSortInfo]="defaultSortInfo"
          [defaultRowSelection]="defaultRowSelection"
          selectionMode="multi-row"
        >
          <infinite-table
            [columns]="columns"
            [defaultColumnPinning]="defaultColumnPinning"
            keyboardNavigation="cell"
            [defaultActiveCellIndex]="defaultActiveCellIndex"
            [domProps]="domProps"
          />
        </infinite-data-source>
      </div>
    </div>
  `,
})
export class ThemeDemo {
  readonly themeName = input.required<string>();
  readonly defaultMode = input<'light' | 'dark'>();

  protected readonly instruments = instruments;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly defaultRowSelection = defaultRowSelection;
  protected readonly defaultColumnPinning = defaultColumnPinning;
  protected readonly defaultActiveCellIndex = defaultActiveCellIndex;
  protected readonly domProps = domProps;

  protected readonly mode = linkedSignal<'light' | 'dark'>(
    () => this.defaultMode() ?? 'light',
  );
  protected readonly density = signal('');
  protected readonly ticking = signal(false);

  protected readonly themeClassName = computed(() =>
    [
      `infinite-theme-name--${this.themeName()}`,
      this.density() ? `infinite-density--${this.density()}` : '',
    ].join(' '),
  );

  private api: any = null;
  private interval: any = null;

  protected onReady(dataSourceApi: any) {
    this.api = dataSourceApi;
  }

  constructor() {
    effect(() => {
      const tick = this.ticking();
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      if (tick) {
        this.interval = setInterval(() => {
          const api = this.api;
          if (!api) return;
          const rows = api.getRowInfoArray();
          for (let i = 0; i < 4; i++) {
            const rowInfo = rows[Math.floor(Math.random() * rows.length)];
            if (rowInfo && !rowInfo.isGroupRow && rowInfo.data) {
              api.updateData(tickInstrument(rowInfo.data));
            }
          }
        }, 120);
      }
    });

    inject(DestroyRef).onDestroy(
      () => this.interval && clearInterval(this.interval),
    );
  }
}
