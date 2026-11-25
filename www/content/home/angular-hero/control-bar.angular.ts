import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { formatCompact, formatInt } from '../../../src/components/hero/format';
import { TICK_RATES } from '../../../src/components/hero/heroTypes';
import {
  HERO_DENSITIES,
  HERO_THEMES,
  type HeroDensity,
} from '../../../src/components/hero/themes';
import { Segmented, type SegmentOption } from './segmented.angular';

const THEME_OPTIONS: SegmentOption<string>[] = HERO_THEMES.map((theme) => ({
  value: theme.id,
  label: theme.label,
  swatch: theme.swatch,
}));
const DENSITY_OPTIONS: SegmentOption<HeroDensity['id']>[] = HERO_DENSITIES.map(
  (density) => ({ value: density.id, label: density.label }),
);

/** The top bar: how the grid looks and how fast the feed ticks. */
@Component({
  selector: 'div[heroControlBar]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Segmented],
  host: { class: 'hero-controls' },
  template: `
    <div
      heroSegmented
      label="Theme"
      hookName="theme"
      [value]="themeId()"
      [options]="themeOptions"
      (valueChange)="themeIdChange.emit($event)"
    ></div>
    <div
      heroSegmented
      label="Density"
      hookName="density"
      [value]="densityId()"
      [options]="densityOptions"
      (valueChange)="densityIdChange.emit($event)"
    ></div>
    <div class="hero-control">
      <label class="hero-control__label" for="hero-tick-rate">Tick rate</label>
      <div class="hero-rate">
        <input
          id="hero-tick-rate"
          type="range"
          min="0"
          [max]="tickRates.length - 1"
          step="1"
          [value]="rateIndex()"
          data-hero-rate
          [attr.aria-valuetext]="rateText()"
          (input)="onRateInput($event)"
        />
        <span class="hero-rate__value hero-num">
          {{ rateLabel() }}/s
          @if (reducedMotion()) {
            <span class="hero-dim"> (reduced motion)</span>
          }
        </span>
      </div>
    </div>
  `,
})
export class ControlBar {
  readonly themeId = input.required<string>();
  readonly densityId = input.required<HeroDensity['id']>();
  readonly ticksPerSecond = input.required<number>();
  readonly reducedMotion = input.required<boolean>();

  readonly themeIdChange = output<string>();
  readonly densityIdChange = output<HeroDensity['id']>();
  readonly ticksPerSecondChange = output<number>();

  protected readonly themeOptions = THEME_OPTIONS;
  protected readonly densityOptions = DENSITY_OPTIONS;
  protected readonly tickRates = TICK_RATES;

  protected readonly rateIndex = computed(() =>
    Math.max(
      0,
      TICK_RATES.findIndex((rate) => rate >= this.ticksPerSecond()),
    ),
  );
  protected readonly rateLabel = computed(() =>
    formatCompact(TICK_RATES[this.rateIndex()]),
  );
  protected readonly rateText = computed(
    () => `${formatInt(TICK_RATES[this.rateIndex()])} ticks per second`,
  );

  protected onRateInput(event: Event) {
    const index = Number((event.target as HTMLInputElement).value);
    this.ticksPerSecondChange.emit(TICK_RATES[index]);
  }
}
