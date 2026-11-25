import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  DataSource,
  InfiniteTable,
  type DataSourceApi,
  type DataSourceGroupBy,
  type DataSourcePivotBy,
  type InfiniteTableApi,
  type InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-angular';

import { HeroFeed } from '../../../src/components/hero/data/feed';
import type { Instrument } from '../../../src/components/hero/data/instruments';
import {
  GROUP_REDUCERS,
  PIVOT_REDUCERS,
  SPARK_VIEW_BOX,
  SPARK_WIDTH,
  getColumnMenuItems,
  makeColumns,
  makeGroupColumn,
  type GroupCell,
  type HeroCellTemplates,
  type MoneyCell,
  type NumCell,
  type PillCell,
  type RangeCell,
  type SparkCell,
  type SymbolCell,
  type VolumeCell,
} from './columns.angular';

export type HeroGridApis = {
  api: InfiniteTableApi<Instrument>;
  dataSourceApi: DataSourceApi<Instrument>;
};

const PIVOT_BY: DataSourcePivotBy<Instrument>[] = [{ field: 'assetClass' }];
// the generated group column ('group-by') goes first, then the ticker
const COLUMN_PINNING: InfiniteTablePropColumnPinning = {
  'group-by': 'start',
  symbol: 'start',
};

/**
 * The id the Infinite Table DevTools extension lists this grid under. It also
 * names the grid's tracks in the Chrome DevTools profiler.
 */
const DEVTOOLS_DEBUG_ID = 'live-demo-angular';

/**
 * The live blotter: one DataSource fed by the worker stream, rendered by one
 * InfiniteTable. Everything below is regular, documented Infinite Table API.
 */
@Component({
  selector: 'hero-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataSource, InfiniteTable],
  host: { style: 'display: contents' },
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="rows()"
      [groupBy]="groupBy()"
      (groupByChange)="groupByChange.emit($event ?? [])"
      [pivotBy]="pivot() ? pivotBy : undefined"
      [aggregationReducers]="pivot() ? pivotReducers : groupReducers"
      selectionMode="single-row"
      [rowSelection]="selectedId()"
      (rowSelectionChange)="onRowSelectionChange($event)"
    >
      <infinite-table
        [debugId]="debugId"
        [columns]="columns()"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
        pivotTotalColumnPosition="end"
        [groupColumn]="groupColumn"
        [getColumnMenuItems]="getColumnMenuItems"
        groupRenderStrategy="single-column"
        [defaultColumnPinning]="columnPinning"
        [defaultColumnVisibility]="initialVisibility"
        [columnDefaultWidth]="110"
        keyboardNavigation="row"
        [domProps]="domProps"
        (ready)="onReady($event)"
      />
    </infinite-data-source>

    <!-- the cells: the values come from the render functions in columns.angular.ts -->
    <ng-template #num let-text="text" let-dim="dim">
      <span class="hero-num" [class.hero-dim]="dim">{{ text }}</span>
    </ng-template>

    <!-- initials avatar tinted by sector + ticker -->
    <ng-template #symbol let-symbol="symbol" let-hue="hue">
      <span class="hero-symbol"
        ><span
          class="hero-symbol__avatar"
          [style.--hero-avatar-hue]="hue"
          aria-hidden="true"
          >{{ symbol.slice(0, 2) }}</span
        ><span class="hero-symbol__ticker">{{ symbol }}</span></span
      >
    </ng-template>

    <ng-template #pill let-tone="tone" let-arrow="arrow" let-text="text">
      <span [class]="'hero-pill hero-pill--' + tone"
        ><span class="hero-pill__arrow" aria-hidden="true">{{ arrow }}</span
        >{{ text }}</span
      >
    </ng-template>

    <ng-template #money let-tone="tone" let-text="text">
      <span [class]="'hero-money hero-money--' + tone">{{ text }}</span>
    </ng-template>

    <!-- inline SVG sparkline of the row's last ticks -->
    <ng-template
      #spark
      let-line="line"
      let-area="area"
      let-up="up"
      let-lastY="lastY"
    >
      <svg
        [class]="'hero-spark hero-spark--' + (up ? 'up' : 'down')"
        [attr.viewBox]="sparkViewBox"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path class="hero-spark__area" [attr.d]="area"></path>
        <path
          class="hero-spark__line"
          [attr.d]="line"
          vector-effect="non-scaling-stroke"
        ></path>
        <circle
          class="hero-spark__dot"
          [attr.cx]="sparkWidth"
          [attr.cy]="lastY"
          r="1.6"
          vector-effect="non-scaling-stroke"
        ></circle>
      </svg>
    </ng-template>

    <!-- traded volume vs a typical day -->
    <ng-template #volume let-scale="scale" let-text="text">
      <span class="hero-vol"
        ><span class="hero-vol__track"
          ><span
            class="hero-vol__bar"
            [style.transform]="'scaleX(' + scale + ')'"
          ></span></span
        ><span class="hero-vol__text">{{ text }}</span></span
      >
    </ng-template>

    <!-- day low → high with a marker at the current price -->
    <ng-template
      #range
      let-title="title"
      let-openAt="openAt"
      let-at="at"
      let-up="up"
    >
      <span class="hero-range" [attr.title]="title"
        ><span class="hero-range__track"></span
        ><span class="hero-range__open" [style.left.%]="openAt"></span
        ><span
          [class]="'hero-range__marker hero-range__marker--' + (up ? 'up' : 'down')"
          [style.left.%]="at"
        ></span
      ></span>
    </ng-template>

    <ng-template #group let-name="name" let-count="count">
      <span class="hero-group"
        ><span class="hero-group__name">{{ name }}</span
        ><span class="hero-group__count">{{ count }}</span></span
      >
    </ng-template>
  `,
})
export class HeroGrid {
  readonly rows = input.required<Instrument[]>();
  readonly groupBy = input.required<DataSourceGroupBy<Instrument>[]>();
  readonly pivot = input.required<boolean>();
  readonly flashDuration = input.required<number>();
  readonly selectedId = input.required<number>();

  readonly groupByChange = output<DataSourceGroupBy<Instrument>[]>();
  readonly selectedIdChange = output<number>();
  readonly ready = output<HeroGridApis>();

  private readonly feed = inject(HeroFeed);

  private readonly numCell = viewChild.required<TemplateRef<NumCell>>('num');
  private readonly symbolCell =
    viewChild.required<TemplateRef<SymbolCell>>('symbol');
  private readonly pillCell = viewChild.required<TemplateRef<PillCell>>('pill');
  private readonly moneyCell =
    viewChild.required<TemplateRef<MoneyCell>>('money');
  private readonly sparkCell =
    viewChild.required<TemplateRef<SparkCell>>('spark');
  private readonly volumeCell =
    viewChild.required<TemplateRef<VolumeCell>>('volume');
  private readonly rangeCell =
    viewChild.required<TemplateRef<RangeCell>>('range');
  private readonly groupCell =
    viewChild.required<TemplateRef<GroupCell>>('group');

  // read when a cell renders, after the view has its templates
  private readonly cells: HeroCellTemplates = {
    num: this.numCell,
    symbol: this.symbolCell,
    pill: this.pillCell,
    money: this.moneyCell,
    spark: this.sparkCell,
    volume: this.volumeCell,
    range: this.rangeCell,
    group: this.groupCell,
  };

  protected readonly debugId = DEVTOOLS_DEBUG_ID;
  protected readonly pivotBy = PIVOT_BY;
  protected readonly pivotReducers = PIVOT_REDUCERS;
  protected readonly groupReducers = GROUP_REDUCERS;
  protected readonly columnPinning = COLUMN_PINNING;
  protected readonly getColumnMenuItems = getColumnMenuItems;
  protected readonly sparkViewBox = SPARK_VIEW_BOX;
  protected readonly sparkWidth = SPARK_WIDTH;
  // the grid fills .hero-grid: the hosts above it add no box (display: contents)
  protected readonly domProps = { style: { height: '100%' } };
  // narrow screens start without the long Name column, so Price fits
  protected readonly initialVisibility: Record<string, false> | undefined =
    window.innerWidth < 640 ? { name: false } : undefined;

  protected readonly groupColumn = makeGroupColumn(this.cells);
  protected readonly columns = computed(() =>
    makeColumns(this.feed, { flashDuration: this.flashDuration() }, this.cells),
  );

  private apis: HeroGridApis | null = null;
  private stopWatchingScroll: (() => void) | null = null;

  constructor() {
    // keep the on-screen rows ticking briskly (see feed.ts - "visible-row subscription")
    this.feed.setFocusProvider(() => {
      const apis = this.apis;
      if (!apis || apis.api.isDestroyed()) return [];
      const range = apis.api.getVisibleRenderRange();
      const ids: number[] = [];
      for (
        let index = range.start[0];
        index < range.end[0] && ids.length < 200;
        index++
      ) {
        const rowInfo = apis.dataSourceApi.getRowInfoByIndex(index);
        if (rowInfo && !rowInfo.isGroupRow && rowInfo.data)
          ids.push((rowInfo.data as Instrument).id);
      }
      return ids;
    });

    inject(DestroyRef).onDestroy(() => {
      this.feed.setFocusProvider(null);
      this.stopWatchingScroll?.();
    });
  }

  // big row counts: commits wait while the grid is being scrolled
  private watchScroll(api: InfiniteTableApi<Instrument>) {
    this.stopWatchingScroll?.();
    const scroller = api.scrollContainer;
    if (!scroller) return;
    const onScroll = () => this.feed.noteScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    this.stopWatchingScroll = () =>
      scroller.removeEventListener('scroll', onScroll);
  }

  protected onReady(ready: HeroGridApis) {
    this.apis = ready;
    this.watchScroll(ready.api);
    this.ready.emit(ready);
  }

  protected onRowSelectionChange(id: unknown) {
    if (typeof id === 'number') this.selectedIdChange.emit(id);
  }
}
