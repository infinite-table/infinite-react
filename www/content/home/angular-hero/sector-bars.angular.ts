import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { HeroFeed } from '../../../src/components/hero/data/feed';
import { SECTORS } from '../../../src/components/hero/data/instruments';
import { formatMoney } from '../../../src/components/hero/format';

const ROW = 19;

const rankOf = (current: number[]) =>
  current.map((_, k) => k).sort((a, b) => current[b] - current[a]);

/**
 * Day P&L per sector, as diverging bars around a zero baseline. Bars re-rank
 * live; rows glide to their new position (CSS transforms), so a reorder reads
 * as movement rather than a jump.
 */
@Component({
  selector: 'section[heroSectorBars]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hero-card hero-sectors',
    'aria-label': 'Day P&L by sector',
  },
  template: `
    <header class="hero-card__header">
      <span class="hero-card__title">Day P&amp;L by sector</span>
      <span
        class="hero-card__value hero-money"
        [class]="'hero-money--' + (total() >= 0 ? 'up' : 'down')"
      >
        {{ money(total()) }}
      </span>
    </header>
    <div class="hero-sectors__rows" [style.height.px]="values().length * row">
      <span class="hero-sectors__zero" aria-hidden="true"></span>
      @for (bar of bars(); track bar.sector; let k = $index) {
        <div
          class="hero-sectors__row"
          [attr.data-hover]="hover() === k ? 'true' : null"
          [style.transform]="bar.transform"
          [attr.title]="bar.sector + ': ' + money(bar.value)"
          (pointerenter)="hover.set(k)"
          (pointerleave)="hover.set(null)"
        >
          <span class="hero-sectors__label">{{ bar.sector }}</span>
          <span class="hero-sectors__track">
            <span
              class="hero-sectors__bar"
              [class]="'hero-sectors__bar--' + (bar.up ? 'up' : 'down')"
              [style.left]="bar.left"
              [style.width]="bar.width"
            ></span>
          </span>
          <span class="hero-sectors__value hero-num">
            {{ money(bar.value) }}
          </span>
        </div>
      }
    </div>
  `,
})
export class SectorBars {
  readonly active = input.required<boolean>();

  private readonly feed = inject(HeroFeed);
  protected readonly row = ROW;
  protected readonly money = formatMoney;

  private readonly read = () => Array.from(this.feed.sectorDayPnl);

  protected readonly values = signal<number[]>(this.read());
  // bars update ~3×/s, but the ranking only every few seconds: constant
  // reshuffling would read as noise, an occasional glide reads as news
  private readonly order = signal<number[]>(rankOf(this.values()));
  protected readonly hover = signal<number | null>(null);

  private readonly rank = computed(() => {
    const result = new Array<number>(this.values().length);
    this.order().forEach((k, index) => (result[k] = index));
    return result;
  });
  private readonly maxAbs = computed(() =>
    Math.max(1, ...this.values().map(Math.abs)),
  );
  protected readonly total = computed(() =>
    this.values().reduce((acc, v) => acc + v, 0),
  );

  protected readonly bars = computed(() => {
    const values = this.values();
    const rank = this.rank();
    const maxAbs = this.maxAbs();
    return SECTORS.map((sector, k) => {
      const value = values[k];
      const width = (Math.abs(value) / maxAbs) * 50;
      const up = value >= 0;
      return {
        sector,
        value,
        up,
        transform: `translateY(${rank[k] * ROW}px)`,
        left: up ? '50%' : `${50 - width}%`,
        width: `${Math.max(0.6, width)}%`,
      };
    });
  });

  constructor() {
    effect((onCleanup) => {
      const active = this.active();
      untracked(() => {
        this.values.set(this.read());
        this.order.set(rankOf(this.values()));
      });
      if (!active) return;
      const valuesTimer = window.setInterval(
        () => this.values.set(this.read()),
        350,
      );
      const orderTimer = window.setInterval(
        () => this.order.set(rankOf(this.values())),
        2600,
      );
      onCleanup(() => {
        window.clearInterval(valuesTimer);
        window.clearInterval(orderTimer);
      });
    });
  }
}
