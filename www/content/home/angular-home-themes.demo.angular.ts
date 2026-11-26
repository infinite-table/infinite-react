/**
 * The themes demo of the Angular home page (/angular): the Angular port of
 * src/components/home/demos/ThemesDemo.tsx, with the same card, data and
 * controls. The home page shows this page in an iframe (FrameDemo.tsx).
 */
import '@infinite-table/infinite-angular/index.css';
// the default theme is in index.css
import '@infinite-table/infinite-angular/theme/terminal.css';
import '@infinite-table/infinite-angular/theme/sheet.css';
import '@infinite-table/infinite-angular/theme/paper.css';
import '@infinite-table/infinite-angular/theme/minimalist.css';
import '@infinite-table/infinite-angular/theme/ocean.css';
import '@infinite-table/infinite-angular/theme/balsam.css';

import './home-demo/page.css';

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  DataSource,
  InfiniteTable,
  renderTemplate,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type InfiniteTablePropColumnVisibility,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-angular';

import {
  type Instrument,
  formatCompact,
  formatPct,
  makeInstruments,
  nameFor,
} from '../../src/components/home/demos/data';
import {
  type ColorMode,
  themeClassName,
} from '../../src/components/home/demos/theme';
import {
  injectReportHeight,
  injectSiteMode,
} from './angular-home/frame.angular';
import { Segmented } from './angular-home/segmented.angular';

const THEMES = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'sheet', label: 'Sheet' },
  { id: 'paper', label: 'Paper' },
  { id: 'default', label: 'Default' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'balsam', label: 'Balsam' },
] as const;
type ThemeId = (typeof THEMES)[number]['id'];

const MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const;

const DENSITIES = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'spacious', label: 'Spacious' },
] as const;
type DensityId = (typeof DENSITIES)[number]['id'];

const groupBy: DataSourcePropGroupBy<Instrument> = [{ field: 'sector' }];

const reducers: DataSourcePropAggregationReducers<Instrument> = {
  volume: {
    field: 'volume',
    initialValue: 0,
    reducer: (acc: number, value: number) => acc + value,
  },
  changePct: {
    field: 'changePct',
    initialValue: 0,
    reducer: (acc: number, value: number) => acc + value,
    done: (sum: number, rows: Instrument[]) =>
      rows.length ? sum / rows.length : 0,
  },
};

const groupColumn: InfiniteTablePropGroupColumn<Instrument> = {
  header: 'Sector',
  defaultWidth: 190,
};
const columnVisibility: InfiniteTablePropColumnVisibility = { sector: false };

// The keyword is built from parts: the demo build would read a whole import
// statement in a string as one of this file's imports.
const IMPORT = ['@im', 'port'].join('');
const cssImport = (path: string) =>
  `${IMPORT} '@infinite-table/infinite-angular/${path}';`;

type ChangeCell = { up: boolean; text: string };

@Component({
  selector: 'demo-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataSource, InfiniteTable, Segmented],
  template: `
    <div #root class="home home-demo home-demo--themes">
      <div class="home-demo__card">
        <div class="home-demo__bar home-demo__bar--wrap">
          <div
            homeSegmented
            label="Theme"
            [options]="themes"
            [value]="theme()"
            (valueChange)="theme.set($event)"
          ></div>
          <div
            homeSegmented
            label="Mode"
            [options]="modes"
            [value]="mode()"
            (valueChange)="mode.set($event)"
          ></div>
          <div
            homeSegmented
            label="Density"
            [options]="densities"
            [value]="density()"
            (valueChange)="density.set($event)"
          ></div>
        </div>
        <div class="home-demo__grid" [class]="className()">
          <infinite-data-source
            [data]="data"
            primaryKey="id"
            [groupBy]="groupBy"
            [aggregationReducers]="reducers"
          >
            <infinite-table
              [columns]="columns"
              [domProps]="domProps"
              [columnDefaultWidth]="130"
              [groupColumn]="groupColumn"
              [defaultColumnVisibility]="columnVisibility"
            />
          </infinite-data-source>
        </div>
        <div class="home-demo__snippet">
          <pre><code>{{ snippet() }}</code></pre>
          <button type="button" class="site-key site-key--sm" (click)="copy()">
            {{ copied() ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>

    <ng-template #changeCell let-up="up" let-text="text">
      <span [class]="up ? 'home-up' : 'home-down'">{{ text }}</span>
    </ng-template>
  `,
})
export default class Themes {
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly changeCell =
    viewChild.required<TemplateRef<ChangeCell>>('changeCell');

  protected readonly themes = THEMES;
  protected readonly modes = MODES;
  protected readonly densities = DENSITIES;
  protected readonly data = makeInstruments(3000);
  protected readonly groupBy = groupBy;
  protected readonly reducers = reducers;
  protected readonly groupColumn = groupColumn;
  protected readonly columnVisibility = columnVisibility;
  protected readonly domProps = { style: { height: '100%' } };

  protected readonly columns: InfiniteTablePropColumns<Instrument> = {
    symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
    name: {
      header: 'Name',
      valueGetter: ({ data }) => nameFor(data.id),
      defaultFlex: 1,
      minWidth: 190,
    },
    sector: { field: 'sector', header: 'Sector' },
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
    region: { field: 'region', header: 'Region', defaultWidth: 110 },
  };

  private readonly siteMode = injectSiteMode();
  protected readonly theme = signal<ThemeId>('terminal');
  protected readonly mode = signal<ColorMode>(this.siteMode());
  protected readonly density = signal<DensityId>('comfortable');
  protected readonly copied = signal(false);

  protected readonly className = computed(() =>
    themeClassName(this.theme(), this.mode(), this.density()),
  );
  protected readonly snippet = computed(() => {
    const theme = this.theme();
    const cssImports = [
      cssImport('index.css'),
      ...(theme === 'default' ? [] : [cssImport(`theme/${theme}.css`)]),
    ].join('\n');
    return `${cssImports}\n\n<div class="${this.className()}">\n  <infinite-table />\n</div>`;
  });

  constructor() {
    injectReportHeight(() => this.root().nativeElement);
    // follow the site toggle; the Mode control can still flip it here
    effect(() => {
      const next = this.siteMode();
      untracked(() => this.mode.set(next));
    });
  }

  protected copy() {
    navigator.clipboard?.writeText(this.snippet()).catch(() => {});
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1500);
  }
}
