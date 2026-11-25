import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { styleWithUnits } from '../../../../utils/styleWithUnits';
import type { CSSProperties } from '../../../types/FrameworkTypes';
import { IconCustomMaskCls } from './Icon.css';
import { CUSTOMIZABLE_ICONS, CustomizableIconName } from './customizableIcons';
import { iconPaths } from './iconPaths';
import { InfiniteIconClassName } from './InfiniteIconClassName';

export const ICON_HOST = {
  '[attr.viewBox]': 'viewBoxValue()',
  '[class]': 'classNameValue()',
  '[style]': 'styleValue()',
};

export const ICON_TEMPLATE = `@for (d of pathsValue(); track $index) {<svg:path [attr.d]="d" />}`;

/**
 * What the svg icons share (Angular sibling of the React Icon wrapper,
 * Icon.tsx): the host IS the svg, sized by `size` (defaults to the
 * `--infinite-icon-size` theme var), filled with the current color, and -
 * for the customizable icons - replaceable through the
 * `--infinite-icon-<name>` CSS variable (see Icon.css.ts).
 */
@Directive()
export abstract class IconBase {
  readonly size = input<number>();
  readonly style = input<CSSProperties | null>();
  readonly className = input<string>();

  protected abstract pathsValue(): readonly string[];
  protected abstract iconValue(): CustomizableIconName | undefined;
  protected viewBoxValue(): string {
    return '0 0 24 24';
  }

  protected readonly styleValue = computed(() => {
    const size = this.size() ?? `var(--infinite-icon-size)`;
    return {
      flex: 'none',
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      fill: 'currentColor',
      ...styleWithUnits(this.style() as Record<string, any> | null),
    };
  });

  protected readonly classNameValue = computed(() => {
    const icon = this.iconValue();
    return icon
      ? join(
          this.className(),
          IconCustomMaskCls[icon],
          InfiniteIconClassName,
          `${InfiniteIconClassName}-${CUSTOMIZABLE_ICONS[icon]}`,
        )
      : this.className() ?? '';
  });
}

/**
 * A generic svg icon: `<svg infiniteIcon [paths]="['M...']" icon="done">`.
 */
@Component({
  selector: 'svg[infiniteIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class Icon extends IconBase {
  readonly viewBox = input<string>('0 0 24 24');
  readonly paths = input.required<readonly string[]>();
  /**
   * When specified, the icon can be replaced via the corresponding
   * `--infinite-icon-*` CSS variable - see Icon.css.ts
   */
  readonly icon = input<CustomizableIconName>();

  protected override pathsValue() {
    return this.paths();
  }
  protected override iconValue() {
    return this.icon();
  }
  protected override viewBoxValue() {
    return this.viewBox();
  }
}

/**
 * The icon shown on the column drag proxy when dropping hides the column.
 */
@Component({
  selector: 'svg[infiniteHiddenIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class HiddenIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.hidden;
  }
  protected override iconValue(): CustomizableIconName {
    return 'hidden';
  }
  protected override viewBoxValue() {
    return '0 -960 960 960';
  }
}
