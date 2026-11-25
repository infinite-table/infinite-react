import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { formatCompact } from '../../../src/components/hero/format';
import {
  ROW_COUNTS,
  type HeroDataMode,
  type HeroView,
} from '../../../src/components/hero/heroTypes';
import { Segmented, type SegmentOption } from './segmented.angular';

const VIEW_OPTIONS: SegmentOption<HeroView>[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'grouped', label: 'By sector' },
  { value: 'pivot', label: 'Pivot' },
];

const DATA_OPTIONS: SegmentOption<HeroDataMode>[] = [
  {
    value: 'client',
    label: 'Client · worker',
    title: 'Ticks simulated in a Web Worker, all rows in the browser',
  },
  {
    value: 'server',
    label: 'Server',
    title: 'Server-side data — coming soon',
    disabled: true,
  },
];

/** The toolbar above the grid: what the grid shows and where data comes from. */
@Component({
  selector: 'div[heroDataControls]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Segmented],
  host: { class: 'hero-toolbar' },
  template: `
    <div
      heroSegmented
      label="View"
      hookName="view"
      [value]="view()"
      [options]="viewOptions"
      (valueChange)="viewChange.emit($event)"
    ></div>
    <div
      heroSegmented
      label="Rows"
      hookName="rows"
      [value]="rowCount()"
      [options]="rowOptions()"
      (valueChange)="rowCountChange.emit($event)"
    ></div>
    <div
      heroSegmented
      label="Data"
      hookName="data"
      [value]="dataMode()"
      [options]="dataOptions"
      (valueChange)="dataModeChange.emit($event)"
    ></div>
  `,
})
export class DataControls {
  readonly view = input.required<HeroView>();
  readonly rowCount = input.required<number>();
  readonly allowMillion = input.required<boolean>();
  readonly dataMode = input.required<HeroDataMode>();

  readonly viewChange = output<HeroView>();
  readonly rowCountChange = output<number>();
  readonly dataModeChange = output<HeroDataMode>();

  protected readonly viewOptions = VIEW_OPTIONS;
  protected readonly dataOptions = DATA_OPTIONS;
  protected readonly rowOptions = computed<SegmentOption<number>[]>(() =>
    ROW_COUNTS.filter((count) => this.allowMillion() || count < 1_000_000).map(
      (count) => ({ value: count, label: formatCompact(count) }),
    ),
  );
}
