import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';

import {
  readPalette,
  type ChartPalette,
} from '../../../src/components/hero/charts/canvasUtils';
import {
  EMPTY_HEATMAP,
  drawHeatmap,
  hitTestHeatmap,
  layoutHeatmap,
} from '../../../src/components/hero/charts/heatmapLayout';
import { HeroFeed } from '../../../src/components/hero/data/feed';
import { injectCanvasSize, injectFrameLoop } from './lifecycle.angular';

/**
 * Market heatmap: the biggest instruments, grouped by sector, sized by market
 * cap and colored by change % on a diverging scale (gray = flat). Click a tile
 * to chart it.
 */
@Component({
  selector: 'section[heroHeatmap]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hero-card hero-heatmap',
    'aria-label': 'Market heatmap by sector',
  },
  template: `
    <header class="hero-card__header">
      <span class="hero-card__title">Market heatmap</span>
      <span class="hero-heatmap__legend" aria-hidden="true">
        <span class="hero-num">−2.5%</span>
        <span class="hero-heatmap__scale"></span>
        <span class="hero-num">+2.5%</span>
      </span>
    </header>
    <div class="hero-heatmap__plot">
      <canvas
        #canvas
        class="hero-canvas"
        style="cursor: pointer"
        (pointermove)="onPointerMove($event)"
        (pointerleave)="onPointerLeave()"
        (click)="onClick($event)"
      ></canvas>
      <div #tooltip class="hero-tooltip" aria-hidden="true"></div>
    </div>
  `,
})
export class Heatmap {
  readonly rowCount = input.required<number>();
  readonly active = input.required<boolean>();
  /** Changes when the theme does, so colors are re-read. */
  readonly themeKey = input.required<string>();

  readonly selectedIdChange = output<number>();

  private readonly feed = inject(HeroFeed);
  private readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly tooltip =
    viewChild.required<ElementRef<HTMLElement>>('tooltip');
  private readonly size = injectCanvasSize(() => this.canvas().nativeElement);

  // read on every draw, so not signals
  private hover = -1;
  private palette: ChartPalette | null = null;

  private readonly laid = computed(() => {
    // the feed's top instruments change with the row count
    const tiles = this.rowCount() ? this.feed.topInstruments(42) : [];
    const size = this.size();
    return size.width
      ? layoutHeatmap(tiles, size.width, size.height)
      : EMPTY_HEATMAP;
  });

  constructor() {
    // the theme's classes land on the hero in the same render: read after it
    afterRenderEffect(() => {
      this.themeKey();
      untracked(() => this.readColors());
    });
    afterRenderEffect(() => {
      this.laid();
      untracked(() => this.draw());
    });
    injectFrameLoop(
      () => this.active(),
      () => this.draw(),
      5,
    );
  }

  private draw() {
    drawHeatmap(this.feed, this.laid(), {
      canvas: this.canvas().nativeElement,
      size: this.size(),
      palette: this.palette,
      hover: this.hover,
      tooltip: this.tooltip().nativeElement,
    });
  }

  private readColors() {
    this.palette = readPalette(this.canvas().nativeElement);
    this.draw();
  }

  protected onPointerMove(event: PointerEvent) {
    const index = hitTestHeatmap(this.laid(), event);
    if (index !== this.hover) {
      this.hover = index;
      this.draw();
    }
  }

  protected onPointerLeave() {
    this.hover = -1;
    this.draw();
  }

  protected onClick(event: MouseEvent) {
    const laid = this.laid();
    const tile = laid.rects[hitTestHeatmap(laid, event)];
    if (tile) this.selectedIdChange.emit(tile.id);
  }
}
