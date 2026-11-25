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

/**
 * Angular siblings of the filter operator icons and the done / clear icons
 * of IconForVue.vue.ts (the operator icons of the default filter types, the
 * icons of the filter operator menu).
 *
 * The host IS the svg (`<svg infiniteDoneIcon>`), same class names as React
 * and Vue: sized by `size` (defaults to the `--infinite-icon-size` theme
 * var), filled with the current color, replaceable through the
 * `--infinite-icon-<name>` CSS variable (see Icon.css.ts).
 */
@Directive({
  host: {
    viewBox: '0 0 24 24',
    '[class]': 'classNameValue()',
    '[style]': 'styleValue()',
  },
})
abstract class PathIcon {
  readonly size = input<number>();
  readonly style = input<CSSProperties | null>();
  readonly className = input<string>();

  protected abstract readonly icon: CustomizableIconName;
  protected abstract readonly paths: readonly string[];

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

  protected readonly classNameValue = computed(() =>
    join(
      this.className(),
      IconCustomMaskCls[this.icon],
      InfiniteIconClassName,
      `${InfiniteIconClassName}-${CUSTOMIZABLE_ICONS[this.icon]}`,
    ),
  );
}

const TEMPLATE = `@for (d of paths; track $index) {<svg:path [attr.d]="d" />}`;

@Component({
  selector: 'svg[infiniteIncludesOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class IncludesOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorContains' as const;
  protected readonly paths = iconPaths.includesOperator;
}

@Component({
  selector: 'svg[infiniteStartsWithOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class StartsWithOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorStartsWith' as const;
  protected readonly paths = iconPaths.startsWithOperator;
}

@Component({
  selector: 'svg[infiniteEndsWithOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class EndsWithOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorEndsWith' as const;
  protected readonly paths = iconPaths.endsWithOperator;
}

@Component({
  selector: 'svg[infiniteEqualOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class EqualOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorEq' as const;
  protected readonly paths = iconPaths.eqOperator;
}

@Component({
  selector: 'svg[infiniteNotEqualOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class NotEqualOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorNeq' as const;
  protected readonly paths = iconPaths.neqOperator;
}

@Component({
  selector: 'svg[infiniteGTOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class GTOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorGt' as const;
  protected readonly paths = iconPaths.gtOperator;
}

@Component({
  selector: 'svg[infiniteGTEOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class GTEOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorGte' as const;
  protected readonly paths = iconPaths.gteOperator;
}

@Component({
  selector: 'svg[infiniteLTOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class LTOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorLt' as const;
  protected readonly paths = iconPaths.ltOperator;
}

@Component({
  selector: 'svg[infiniteLTEOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class LTEOperatorIcon extends PathIcon {
  protected readonly icon = 'filterOperatorLte' as const;
  protected readonly paths = iconPaths.lteOperator;
}

@Component({
  selector: 'svg[infiniteDoneIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class DoneIcon extends PathIcon {
  protected readonly icon = 'done' as const;
  protected readonly paths = iconPaths.done;
}

@Component({
  selector: 'svg[infiniteClearIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: TEMPLATE,
})
export class ClearIcon extends PathIcon {
  protected readonly icon = 'clear' as const;
  protected readonly paths = iconPaths.clear;
}
