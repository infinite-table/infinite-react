import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { join } from '../../../../../utils/join';
import { styleWithUnits } from '../../../../../utils/styleWithUnits';
import type { CSSProperties } from '../../../../types/FrameworkTypes';
import { HeaderFilterIconIndexCls } from '../../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from '../InfiniteIconClassName';
import { FilterIconCls, FilterIconLineCls } from './FilterIcon.css';
import { defaultLineStyle } from './shared';

const HOST_CLASS_NAME = join(
  InfiniteIconClassName,
  FilterIconCls,
  `${InfiniteIconClassName}-filter`,
);

/**
 * Angular sibling of FilterIcon: the host IS the icon div
 * (`<div infiniteFilterIcon>`), same DOM as React and Vue
 * (data-name="filter-icon", three lines with decreasing widths) and the same
 * fade-in.
 */
@Component({
  selector: 'div[infiniteFilterIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-name': 'filter-icon',
    '[style]': 'hostStyle()',
    '[class]': 'hostClassName()',
  },
  template: `@if (showIndex()) {<div data-name="index" [class]="indexClassName">{{ index() }}</div>}<div [class]="lineClassName" [style]="lineStyles()[0]"></div><div [class]="lineClassName" [style]="lineStyles()[1]"></div><div [class]="lineClassName" [style]="lineStyles()[2]"></div>`,
})
export class FilterIcon {
  readonly size = input<number>();
  readonly lineWidth = input<number>();
  readonly lineStyle = input<CSSProperties | null>();
  readonly style = input<CSSProperties | null>();
  readonly className = input<string>();
  readonly index = input<number>();

  protected readonly indexClassName = HeaderFilterIconIndexCls;
  protected readonly lineClassName = FilterIconLineCls;

  private readonly opacity = signal(0);
  private rafId: number | null = null;

  private readonly sizeValue = computed(() => this.size() ?? 16);

  protected readonly showIndex = computed(() => {
    const index = this.index();
    return index != null && index > 0;
  });

  protected readonly hostStyle = computed(() => ({
    ...styleWithUnits(this.style() as Record<string, any> | null),
    width: `${this.sizeValue()}px`,
  }));

  protected readonly hostClassName = computed(() =>
    join(this.className(), HOST_CLASS_NAME),
  );

  protected readonly lineStyles = computed(() => {
    const size = this.sizeValue();
    const part = Math.floor(size / 4);
    const sizes = [size - 1 * part, size - 2 * part, size - 3 * part];

    const lineStyle = {
      ...defaultLineStyle,
      borderTop: `${this.lineWidth() ?? 1}px solid currentColor`,
      ...styleWithUnits(this.lineStyle() as Record<string, any> | null),
      opacity: this.opacity(),
    } as Record<string, any>;

    return sizes.map((width) => ({ width: `${width}px`, ...lineStyle }));
  });

  constructor() {
    // fade in after the first paint (React: the mount effect)
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.opacity.set(1);
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.rafId != null) {
        cancelAnimationFrame(this.rafId);
      }
    });
  }
}
