import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { join } from '../../../../../utils/join';
import { styleWithUnits } from '../../../../../utils/styleWithUnits';
import type { CSSProperties } from '../../../../types/FrameworkTypes';
import { HeaderSortIconIndexCls } from '../../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from '../InfiniteIconClassName';
import {
  SortIconCls,
  SortIconDirectionCls,
  SortIconLineCls,
} from './SortIcon.css';
import { defaultLineStyle } from './shared';
import type { SortIconProps } from './shared';

/**
 * Angular sibling of SortIcon: the host IS the icon div
 * (`<div infiniteSortIcon [direction]="1">`), same DOM as React and Vue
 * (data-name="sort-icon", three lines with animated widths, the optional
 * sort index) and the same fade in / out.
 *
 * React and Vue render nothing once the icon faded out after the sort was
 * cleared; the host can't be removed from inside, so it gets
 * `display: none` instead (only happens with
 * `headerOptions.alwaysReserveSpaceForSortIcon`).
 */
@Component({
  selector: 'div[infiniteSortIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-name': 'sort-icon',
    '[style]': 'hostStyle()',
    '[class]': 'hostClassName()',
  },
  template: `@if (showIndex()) {<div data-name="index" [style]="indexStyle()" [class]="indexClassName">{{ index() }}</div>}<div [class]="lineClassName" [style]="lineStyles()[0]" (transitionend)="onTransitionEnd()"></div><div [class]="lineClassName" [style]="lineStyles()[1]"></div><div [class]="lineClassName" [style]="lineStyles()[2]"></div>`,
})
export class SortIcon {
  readonly direction = input<SortIconProps['direction']>(0);
  readonly size = input<number>();
  readonly lineWidth = input<number>();
  readonly lineStyle = input<CSSProperties | null>();
  readonly style = input<CSSProperties | null>();
  readonly className = input<string>();
  readonly index = input<number>();
  readonly forceSize = input<boolean>();

  protected readonly indexClassName = HeaderSortIconIndexCls;
  protected readonly lineClassName = SortIconLineCls;

  private readonly rendered = signal(true);
  private readonly opacity = signal(0);

  private rafId: number | null = null;

  private readonly sizeValue = computed(() => this.size() ?? 16);

  private readonly directionName = computed(() => {
    const direction = this.direction();
    return direction === 1 ? 'asc' : direction === -1 ? 'desc' : 'none';
  });

  protected readonly showIndex = computed(() => {
    const index = this.index();
    return index != null && index > 0;
  });

  protected readonly hostStyle = computed(() => {
    const style: Record<string, any> = {
      ...styleWithUnits(this.style() as Record<string, any> | null),
      width: `${this.sizeValue()}px`,
    };
    if (!this.rendered() && !this.forceSize()) {
      style.display = 'none';
    }
    return style;
  });

  protected readonly hostClassName = computed(() => {
    const directionName = this.directionName();
    return join(
      this.className(),
      InfiniteIconClassName,
      SortIconCls,
      SortIconDirectionCls[directionName],
      `${InfiniteIconClassName}-sort`,
      `${InfiniteIconClassName}-sort--${directionName}`,
    );
  });

  protected readonly indexStyle = computed(() =>
    this.direction() === -1 ? { top: '100%' } : null,
  );

  protected readonly lineStyles = computed(() => {
    const direction = this.direction();
    const size = this.sizeValue();
    const part = Math.floor(size / 4);

    const sizes = direction
      ? [size - 3 * part, size - 2 * part, size - part]
      : [0, 0, 0];

    if (direction === -1) {
      sizes.reverse();
    }

    const lineStyle = {
      ...defaultLineStyle,
      borderTop: `${this.lineWidth() ?? 1}px solid currentColor`,
      ...styleWithUnits(this.lineStyle() as Record<string, any> | null),
      opacity: this.opacity(),
    } as Record<string, any>;

    return sizes.map((width) => ({ width: `${width}px`, ...lineStyle }));
  });

  constructor() {
    // fade in when sorted, fade out when the sort is cleared (React: the
    // effect on direction)
    effect(() => {
      const direction = this.direction();
      untracked(() => {
        const newOpacity = direction != 0 ? 1 : 0;

        if (!this.rendered() && newOpacity) {
          this.rendered.set(true);
        }
        if (newOpacity !== this.opacity()) {
          if (this.rafId != null) {
            cancelAnimationFrame(this.rafId);
          }
          this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.opacity.set(newOpacity);
          });
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.rafId != null) {
        cancelAnimationFrame(this.rafId);
      }
    });
  }

  protected onTransitionEnd() {
    const hidden = this.opacity() === 0 && this.direction() === 0;
    const rendered = !hidden;
    if (rendered !== this.rendered()) {
      this.rendered.set(rendered);
    }
  }
}
