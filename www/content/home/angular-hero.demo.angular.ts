/**
 * The hero of the Angular home page (/angular): a ticking trading blotter (the
 * Angular Infinite Table fed by a Web Worker simulation), charts fed by the
 * same stream, a control bar, and a scripted "live control" show that hands
 * over on the first interaction.
 *
 * The Angular port of src/components/hero/HeroDemo.tsx. The feed, the worker,
 * the script of the show, the chart drawing and the styles have no framework
 * code and are shared with the React and Vue heroes; the components are in
 * ./angular-hero. The home page shows this demo's page in an iframe
 * (HeroFrameShowcase.tsx).
 */
import '@infinite-table/infinite-angular/index.css';
// extra grid themes the hero can switch to (the default one is in index.css)
import '@infinite-table/infinite-angular/theme/terminal.css';
import '@infinite-table/infinite-angular/theme/sheet.css';
import '@infinite-table/infinite-angular/theme/paper.css';

import '../../node_modules/@thedatagrid/docs-kit/dist/showcase/styles.css';
import '../../src/components/hero/hero-tokens.css';
import '../../src/components/hero/hero.css';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { DataSourceGroupBy } from '@infinite-table/infinite-angular';
import type { ShowcaseScriptContext } from '@thedatagrid/docs-kit/showcase';

import { HeroFeed } from '../../src/components/hero/data/feed';
import type { Instrument } from '../../src/components/hero/data/instruments';
import { formatInt } from '../../src/components/hero/format';
import {
  resetHeroState,
  runHeroScript,
  type HeroController,
} from '../../src/components/hero/heroScript';
import {
  BUILD_MESSAGE_THRESHOLD,
  DEFAULT_ROW_COUNT,
  DEFAULT_TICK_RATE,
  REDUCED_MOTION_TICK_CAP,
  canHandleMillionRows,
  type HeroDataMode,
  type HeroView,
} from '../../src/components/hero/heroTypes';
import {
  DEFAULT_DENSITY_ID,
  DEFAULT_THEME_ID,
  getHeroDensity,
  themeClassName,
  type HeroDensity,
} from '../../src/components/hero/themes';
import { AutomatedDemo } from './angular-hero/automated-demo.angular';
import { ControlBar } from './angular-hero/control-bar.angular';
import { DataControls } from './angular-hero/data-controls.angular';
import { Heatmap } from './angular-hero/heatmap.angular';
import { HeroGrid, type HeroGridApis } from './angular-hero/hero-grid.angular';
import {
  injectColorMode,
  injectInView,
  injectPageVisible,
  injectPrefersReducedMotion,
} from './angular-hero/lifecycle.angular';
import { PriceChart } from './angular-hero/price-chart.angular';
import { SectorBars } from './angular-hero/sector-bars.angular';
import { StatsStrip } from './angular-hero/stats-strip.angular';

const GROUP_BY_SECTOR: DataSourceGroupBy<Instrument>[] = [{ field: 'sector' }];
const NO_GROUPS: DataSourceGroupBy<Instrument>[] = [];

// `?autoplay=0` turns the scripted show off
const autoplay = new URLSearchParams(location.search).get('autoplay') !== '0';

// The tick worker is an entry of this page's import map (docs-kit.config.mjs).
const createFeed = () =>
  new HeroFeed({
    createWorker: () =>
      new Worker(import.meta.resolve('hero-tick-worker'), {
        type: 'module',
        name: 'hero-ticks',
      }),
  });

@Component({
  selector: 'demo-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AutomatedDemo,
    ControlBar,
    DataControls,
    HeroGrid,
    StatsStrip,
    PriceChart,
    SectorBars,
    Heatmap,
  ],
  // one feed for the grid and the charts: the components inject it
  providers: [{ provide: HeroFeed, useFactory: createFeed }],
  template: `
    <div
      heroAutomatedDemo
      class="hero-auto hero-auto--page hero-frame"
      [ready]="autoplay && !!rows() && !!apis()"
      waitForSelector=".InfiniteColumnCell"
      [run]="runShow"
      [reset]="resetShow"
    >
      <div
        #root
        class="hero"
        [class]="heroClassName()"
        [attr.data-hero-mode]="mode()"
      >
        <div
          heroControlBar
          [themeId]="themeId()"
          [densityId]="densityId()"
          [ticksPerSecond]="ticksPerSecond()"
          [reducedMotion]="reducedMotion()"
          (themeIdChange)="themeId.set($event)"
          (densityIdChange)="densityId.set($event)"
          (ticksPerSecondChange)="ticksPerSecond.set($event)"
        ></div>
        <div class="hero-body">
          <div class="hero-main">
            <div
              heroDataControls
              [view]="view()"
              [rowCount]="rowCount()"
              [allowMillion]="allowMillion"
              [dataMode]="dataMode()"
              (viewChange)="setView($event)"
              (rowCountChange)="rowCount.set($event)"
              (dataModeChange)="dataMode.set($event)"
            ></div>
            <div class="hero-grid">
              @if (rows(); as rows) {
                <hero-grid
                  [rows]="rows"
                  [groupBy]="groupBy()"
                  [pivot]="pivot()"
                  [flashDuration]="reducedMotion() ? 1600 : 700"
                  [selectedId]="selectedId()"
                  (groupByChange)="onGroupByChange($event)"
                  (selectedIdChange)="selectedId.set($event)"
                  (ready)="apis.set($event)"
                />
              }
              @if (building(); as building) {
                <div class="hero-grid__busy">{{ building }}</div>
              }
            </div>
            <div heroStatsStrip [building]="building()"></div>
          </div>
          <aside
            class="hero-side"
            aria-label="Charts fed by the same live stream"
          >
            @if (selectedId() >= 0) {
              <section
                heroPriceChart
                [selectedId]="selectedId()"
                [active]="running()"
                [themeKey]="themeKey()"
              ></section>
            }
            <section
              heroSectorBars
              [active]="running() && !!rows()"
            ></section>
            <section
              heroHeatmap
              [rowCount]="rows()?.length ?? 0"
              [active]="running() && !!rows()"
              [themeKey]="themeKey()"
              (selectedIdChange)="selectedId.set($event)"
            ></section>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: `
    /*
     * This page is only the hero: it fills the iframe the home page gives it.
     * hero-frame gives the pills of the show the hero's tokens (hero-tokens.css).
     */
    .hero-auto--page {
      flex: 1;
      min-height: 0;
      /* the scripted cursor goes above the grid's menus (z-index 10000000) */
      --showcase-z: 2147483600;
    }
  `,
})
export default class AngularHero {
  private readonly feed = inject(HeroFeed);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  protected readonly autoplay = autoplay;
  protected readonly reducedMotion = injectPrefersReducedMotion();
  private readonly pageVisible = injectPageVisible();
  private readonly inView = injectInView(() => this.root().nativeElement);
  protected readonly mode = injectColorMode();

  protected readonly themeId = signal(DEFAULT_THEME_ID);
  protected readonly densityId = signal<HeroDensity['id']>(DEFAULT_DENSITY_ID);
  protected readonly ticksPerSecond = signal(DEFAULT_TICK_RATE);
  protected readonly rowCount = signal(DEFAULT_ROW_COUNT);
  protected readonly dataMode = signal<HeroDataMode>('client');
  protected readonly groupBy = signal(NO_GROUPS);
  protected readonly pivot = signal(false);
  protected readonly selectedId = signal(-1);
  // up to a million rows, which the grid owns: never compared or copied
  protected readonly rows = signal<Instrument[] | null>(null);
  protected readonly building = signal<string | null>(null);
  protected readonly apis = signal<HeroGridApis | null>(null);
  protected readonly allowMillion = canHandleMillionRows();

  private readonly density = computed(() => getHeroDensity(this.densityId()));
  protected readonly view = computed<HeroView>(() =>
    this.pivot() ? 'pivot' : this.groupBy().length ? 'grouped' : 'flat',
  );
  protected readonly running = computed(
    () => this.pageVisible() && this.inView(),
  );
  protected readonly themeKey = computed(
    () => `${this.themeId()}-${this.mode()}`,
  );
  protected readonly heroClassName = computed(
    () =>
      `${themeClassName(this.themeId(), this.mode())} ${
        this.density().className
      }`,
  );

  constructor() {
    const feed = this.feed;
    afterNextRender(() => feed.start());
    inject(DestroyRef).onDestroy(() => feed.dispose());

    effect(() =>
      feed.setTicksPerSecond(
        this.reducedMotion()
          ? Math.min(this.ticksPerSecond(), REDUCED_MOTION_TICK_CAP)
          : this.ticksPerSecond(),
      ),
    );

    // pause when the tab is hidden or the hero is scrolled away
    effect(() => feed.setRunning(this.running() && !!this.rows()));

    effect(() => feed.attach(this.apis()?.dataSourceApi ?? null));

    // (re)build rows when the row count changes; ticks are held meanwhile
    effect((onCleanup) => {
      const count = this.rowCount();
      const controller = new AbortController();
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        feed.hold(false);
      };
      onCleanup(() => {
        controller.abort();
        release();
      });
      untracked(() => {
        feed.hold(true);
        const label = `building ${formatInt(count)} rows…`;
        if (count > BUILD_MESSAGE_THRESHOLD) this.building.set(label);
        void feed
          .buildRows(count, {
            signal: controller.signal,
            onProgress: (p) => {
              if (count > BUILD_MESSAGE_THRESHOLD && p < 1)
                this.building.set(`${label} ${Math.round(p * 100)}%`);
            },
          })
          .then((built) => {
            if (!built || controller.signal.aborted) return;
            feed.setRowCount(count);
            this.rows.set(built);
            this.building.set(null);
            const selected = this.selectedId();
            if (selected < 0 || selected >= count) {
              this.selectedId.set(feed.topInstruments(1)[0]?.id ?? 0);
            }
            // let the DataSource load the new array before ticks are committed again
            requestAnimationFrame(() => requestAnimationFrame(release));
          });
      });
    });

    effect(() => {
      const id = this.selectedId();
      if (id >= 0) untracked(() => feed.select(id));
    });

    // tell the page that embeds the hero it is live, once the first rows painted
    const announce = effect(() => {
      if (!this.rows() || !this.apis()) return;
      announce.destroy();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'hero-live' }, location.origin);
          }
        }),
      );
    });
  }

  protected setView(next: HeroView) {
    this.pivot.set(next === 'pivot');
    this.groupBy.set(next === 'flat' ? NO_GROUPS : GROUP_BY_SECTOR);
  }

  protected onGroupByChange(next: DataSourceGroupBy<Instrument>[]) {
    this.groupBy.set(next);
    if (!next.length) this.pivot.set(false);
  }

  // ---- the scripted show: it clicks the real UI, with these as fallbacks ----
  private readonly controller: HeroController = {
    feed: this.feed,
    getApis: () => this.apis(),
    getState: () => ({
      rowCount: this.rowCount(),
      themeId: this.themeId(),
      view: this.view(),
      building: this.building(),
      rows: this.rows(),
      densityId: this.densityId(),
    }),
    setView: (view) => this.setView(view),
    setRowCount: (count) => this.rowCount.set(count),
    setThemeId: (id) => this.themeId.set(id),
    setDensityId: (id) => this.densityId.set(getHeroDensity(id).id),
    setTicksPerSecond: (rate) => this.ticksPerSecond.set(rate),
    select: (id) => this.selectedId.set(id),
  };

  protected readonly runShow = (context: ShowcaseScriptContext) =>
    runHeroScript({ ...context, hero: this.controller });
  protected readonly resetShow = (context: ShowcaseScriptContext) =>
    resetHeroState({ ...context, hero: this.controller });
}
