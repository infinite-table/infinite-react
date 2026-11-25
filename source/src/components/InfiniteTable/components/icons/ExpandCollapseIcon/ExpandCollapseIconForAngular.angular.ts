import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { join } from '../../../../../utils/join';
import { IconCustomMaskCls } from '../Icon.css';
import { InfiniteIconClassName } from '../InfiniteIconClassName';
import {
  ExpanderIconCls,
  ExpanderIconClsVariants,
} from './ExpandCollapseIcon.css';
import { expandCollapseIconPath } from './shared';
import type { CSSProperties } from '../../../../types/FrameworkTypes';

const THIS_ICON = `${InfiniteIconClassName}-expand-collapse`;

/**
 * Angular sibling of ExpandCollapseIcon - the host IS the svg
 * (`<svg infiniteExpandCollapseIcon>`), same data attributes and class names
 * as React and Vue. `expanded` is controlled when bound, `defaultExpanded`
 * uncontrolled; a click emits `(change)` and calls `[onChange]`.
 */
@Component({
  selector: 'svg[infiniteExpandCollapseIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<svg:path [attr.d]="path" />`,
  host: {
    'data-name': 'expand-collapse-icon',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    '[attr.data-state]': 'currentState()',
    '[attr.data-disabled]': 'disabled() ?? false',
    '[attr.height]': "(size() ?? 24) + 'px'",
    '[attr.width]': "(size() ?? 24) + 'px'",
    '[style]': 'style()',
    '[class]': 'classNameValue()',
    '(click)': 'onClick()',
  },
})
export class ExpandCollapseIcon {
  readonly size = input<number>();
  readonly expanded = input<boolean>();
  readonly defaultExpanded = input<boolean>();
  readonly disabled = input<boolean>();
  readonly direction = input<'end' | 'start'>();
  readonly style = input<CSSProperties | null>();
  readonly className = input<string>();
  readonly onChange = input<(expanded: boolean) => void>();
  readonly change = output<boolean>();

  protected readonly path = expandCollapseIconPath;

  private readonly localExpanded = signal<boolean | null>(null);

  private readonly isExpanded = computed(() => {
    const expanded = this.expanded();
    if (expanded !== undefined) {
      return !!expanded;
    }
    const local = this.localExpanded();
    return local ?? !!this.defaultExpanded();
  });

  protected readonly currentState = computed(() =>
    this.isExpanded() ? 'expanded' : 'collapsed',
  );

  protected readonly classNameValue = computed(() => {
    const disabled = !!this.disabled();
    const direction = this.direction() || 'start';
    return join(
      this.className(),
      ExpanderIconCls,
      IconCustomMaskCls.expandCollapse,
      ExpanderIconClsVariants({
        direction,
        expanded: this.isExpanded(),
        disabled,
      }),
      InfiniteIconClassName,
      THIS_ICON,
      `${THIS_ICON}--${this.currentState()}`,
      `${THIS_ICON}--${direction === 'end' ? 'end' : 'start'}`,
      disabled ? `${THIS_ICON}--disabled` : '',
    );
  });

  protected onClick() {
    if (this.disabled()) {
      return;
    }
    const newExpanded = !this.isExpanded();
    this.onChange()?.(newExpanded);
    this.change.emit(newExpanded);
    if (this.expanded() === undefined) {
      this.localExpanded.set(newExpanded);
    }
  }
}
