/**
 * The million rows demo of the Angular home page (/angular): the Angular port
 * of src/components/home/demos/MillionRowsDemo.tsx, with the same card, data
 * and controls. The home page shows this page in an iframe (FrameDemo.tsx).
 */
import '@infinite-table/infinite-angular/index.css';
import '@infinite-table/infinite-angular/theme/terminal.css';

import './home-demo/page.css';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  DataSource,
  InfiniteTable,
  renderTemplate,
  type InfiniteTableApi,
  type InfiniteTableColumn,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

import {
  type Instrument,
  formatCompact,
  formatInt,
  formatPct,
  makeInstrumentsChunked,
  nameFor,
} from '../../src/components/home/demos/data';
import { themeClassName } from '../../src/components/home/demos/theme';
import {
  injectReportHeight,
  injectSiteMode,
} from './angular-home/frame.angular';

/** A million rows where there's room for them; 100k on phones. */
function rowCount() {
  const small = window.matchMedia('(max-width: 767px)').matches;
  const lowMemory =
    'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
  return small || lowMemory ? 100_000 : 1_000_000;
}

const derived = (
  header: string,
  fn: (row: Instrument) => number,
  digits = 2,
): InfiniteTableColumn<Instrument> => ({
  header,
  type: 'number',
  align: 'end',
  defaultWidth: 110,
  valueGetter: ({ data }) => fn(data),
  renderValue: ({ value }) => (value == null ? null : value.toFixed(digits)),
});

type ChangeCell = { up: boolean; text: string };

const sameRange = (a: [number, number] | null, b: [number, number] | null) =>
  a === b || (!!a && !!b && a[0] === b[0] && a[1] === b[1]);

@Component({
  selector: 'demo-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataSource, InfiniteTable],
  template: `
    <div #root class="home home-demo home-demo--million">
      <div class="home-demo__card">
        <div class="home-demo__bar">
          <span class="home-demo__readout">
            <b>{{ format(count) }}</b> rows × {{ columnCount }} columns
            @if (data()) {
              · data built in {{ format(buildMs()) }} ms
            }
            @if (range(); as range) {
              · rows
              <b>{{ format(range[0] + 1) }}–{{ format(range[1]) }}</b>
              in view
            }
          </span>
          <span class="home-demo__spacer"></span>
          <button type="button" class="site-key site-key--sm" (click)="jump(0)">
            Top
          </button>
          <button
            type="button"
            class="site-key site-key--sm"
            (click)="jumpToRandomRow()"
          >
            Random row
          </button>
          <button type="button" class="site-key site-key--sm" (click)="jump(1)">
            Bottom
          </button>
        </div>
        <div
          class="home-demo__grid home-grid--site"
          [class]="gridClassName()"
        >
          @if (data(); as data) {
            <infinite-data-source [data]="data" primaryKey="id">
              <infinite-table
                [columns]="columns"
                [domProps]="domProps"
                [columnDefaultWidth]="110"
                (ready)="onReady($event)"
              />
            </infinite-data-source>
          } @else {
            <div class="home-demo__loading">
              building {{ format(progress()) }} / {{ format(count) }} rows…
            </div>
          }
        </div>
      </div>
    </div>

    <ng-template #changeCell let-up="up" let-text="text">
      <span [class]="up ? 'home-up' : 'home-down'">{{ text }}</span>
    </ng-template>
  `,
})
export default class MillionRows {
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly changeCell =
    viewChild.required<TemplateRef<ChangeCell>>('changeCell');

  protected readonly format = formatInt;
  protected readonly count = rowCount();
  protected readonly domProps = { style: { height: '100%' } };

  protected readonly columns: InfiniteTablePropColumns<Instrument> = {
    id: {
      field: 'id',
      header: '#',
      type: 'number',
      align: 'end',
      defaultWidth: 110,
      renderValue: ({ value }) => formatInt(value + 1),
    },
    symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
    name: {
      header: 'Name',
      valueGetter: ({ data }) => nameFor(data.id),
      defaultWidth: 230,
    },
    sector: { field: 'sector', header: 'Sector', defaultWidth: 150 },
    price: {
      field: 'price',
      header: 'Price',
      type: 'number',
      align: 'end',
      defaultWidth: 100,
      renderValue: ({ value }) => (value == null ? null : value.toFixed(2)),
    },
    changePct: {
      field: 'changePct',
      header: 'Chg %',
      type: 'number',
      align: 'end',
      defaultWidth: 100,
      renderValue: ({ value }) =>
        value == null
          ? null
          : renderTemplate(this.changeCell(), {
              up: value >= 0,
              text: formatPct(value),
            }),
    },
    volume: {
      field: 'volume',
      header: 'Volume',
      type: 'number',
      align: 'end',
      defaultWidth: 110,
      renderValue: ({ value }) => (value == null ? null : formatCompact(value)),
    },
    bid: derived('Bid', (d) => d.price * 0.9996),
    ask: derived('Ask', (d) => d.price * 1.0004),
    open: derived('Open', (d) => d.price / (1 + d.changePct / 100)),
    high: derived('High', (d) => d.price * 1.012),
    low: derived('Low', (d) => d.price * 0.987),
    region: { field: 'region', header: 'Region', defaultWidth: 110 },
    beta: derived('Beta', (d) => 0.4 + ((d.id * 37) % 160) / 100),
    pe: derived('P/E', (d) => 6 + ((d.id * 53) % 420) / 10, 1),
    position: derived('Position', (d) => ((d.id * 97) % 9000) * 10, 0),
  };
  protected readonly columnCount = Object.keys(this.columns).length;

  private readonly mode = injectSiteMode();
  protected readonly gridClassName = computed(() =>
    themeClassName('terminal', this.mode(), 'compact'),
  );

  protected readonly data = signal<Instrument[] | null>(null);
  protected readonly progress = signal(0);
  protected readonly buildMs = signal(0);
  protected readonly range = signal<[number, number] | null>(null, {
    equal: sameRange,
  });
  private api: InfiniteTableApi<Instrument> | null = null;

  constructor() {
    injectReportHeight(() => this.root().nativeElement);

    const controller = new AbortController();
    let timer = 0;
    afterNextRender(() => {
      const start = performance.now();
      makeInstrumentsChunked(
        this.count,
        (done) => this.progress.set(done),
        controller.signal,
      ).then((rows) => {
        this.buildMs.set(Math.round(performance.now() - start));
        this.data.set(rows);
        timer = window.setInterval(() => {
          const renderRange = this.api?.getVisibleRenderRange();
          if (renderRange) {
            this.range.set([renderRange.start[0], renderRange.end[0]]);
          }
        }, 250);
      });
    });
    inject(DestroyRef).onDestroy(() => {
      controller.abort();
      clearInterval(timer);
    });
  }

  protected onReady(ready: { api: InfiniteTableApi<Instrument> }) {
    this.api = ready.api;
  }

  protected jump(fraction: number) {
    if (this.api) {
      this.api.scrollTop = Math.round(fraction * this.api.scrollTopMax);
    }
  }

  protected jumpToRandomRow() {
    this.jump(0.05 + Math.random() * 0.9);
  }
}
