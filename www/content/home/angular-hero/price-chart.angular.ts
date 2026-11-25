import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';

import {
  readPalette,
  type ChartPalette,
} from '../../../src/components/hero/charts/canvasUtils';
import { drawPriceChart } from '../../../src/components/hero/charts/drawPriceChart';
import { HeroFeed } from '../../../src/components/hero/data/feed';
import { makeInstrument } from '../../../src/components/hero/data/instruments';
import { injectCanvasSize, injectFrameLoop } from './lifecycle.angular';

/**
 * Live price line for the selected row: one minute of 200ms samples that
 * scrolls smoothly, the open as a dashed reference, crosshair on hover.
 */
@Component({
  selector: 'section[heroPriceChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hero-card hero-price',
    '[attr.aria-label]': '"Live price of " + info().symbol',
  },
  template: `
    <header class="hero-card__header">
      <div class="hero-price__title">
        <span class="hero-card__title">{{ info().symbol }}</span>
        <span class="hero-card__subtitle">{{ info().name }}</span>
      </div>
      <div class="hero-price__quote">
        <span #price class="hero-price__last hero-num"></span>
        <span #change class="hero-price__change hero-num"></span>
      </div>
    </header>
    <div class="hero-price__plot">
      <canvas
        #canvas
        class="hero-canvas"
        (pointermove)="onPointerMove($event)"
        (pointerleave)="hover = null"
      ></canvas>
      <div #tooltip class="hero-tooltip" aria-hidden="true"></div>
    </div>
  `,
})
export class PriceChart {
  readonly selectedId = input.required<number>();
  readonly active = input.required<boolean>();
  /** Changes when the theme does, so colors are re-read. */
  readonly themeKey = input.required<string>();

  private readonly feed = inject(HeroFeed);
  private readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly price = viewChild.required<ElementRef<HTMLElement>>('price');
  private readonly change =
    viewChild.required<ElementRef<HTMLElement>>('change');
  private readonly tooltip =
    viewChild.required<ElementRef<HTMLElement>>('tooltip');
  private readonly size = injectCanvasSize(() => this.canvas().nativeElement);

  // read every frame, so not signals
  protected hover: number | null = null;
  private palette: ChartPalette | null = null;

  protected readonly info = computed(() =>
    makeInstrument(this.selectedId(), { price: 0, volume: 0 }),
  );

  constructor() {
    // the theme's classes land on the hero in the same render: read after it
    afterRenderEffect(() => {
      this.themeKey();
      untracked(() => this.readColors());
    });

    injectFrameLoop(
      () => this.active(),
      (now) => this.draw(now),
      60,
    );
    // draw once when paused, so it never shows blank
    afterRenderEffect(() => {
      const active = this.active();
      this.selectedId();
      this.themeKey();
      this.size();
      if (!active) untracked(() => this.draw(performance.now()));
    });
  }

  private draw(now: number) {
    drawPriceChart(
      this.feed,
      {
        canvas: this.canvas().nativeElement,
        size: this.size(),
        palette: this.palette,
        hover: this.hover,
        tooltip: this.tooltip().nativeElement,
        price: this.price().nativeElement,
        change: this.change().nativeElement,
      },
      now,
    );
  }

  private readColors() {
    this.palette = readPalette(this.canvas().nativeElement);
  }

  protected onPointerMove(event: PointerEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.hover = event.clientX - rect.left;
  }
}
