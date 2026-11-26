import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

import type { CustomizableIconName } from './customizableIcons';
import { iconPaths } from './iconPaths';
import { ICON_HOST, ICON_TEMPLATE, IconBase } from './IconForAngular.angular';

/**
 * Angular siblings of the filter operator icons and the done / clear icons
 * of IconForVue.vue.ts (the operator icons of the default filter types, the
 * icons of the filter operator menu), on the shared svg icon base
 * (IconForAngular.angular.ts): the host IS the svg (`<svg infiniteDoneIcon>`),
 * same class names as React and Vue, replaceable through the
 * `--infinite-icon-<name>` CSS variable.
 */

@Component({
  selector: 'svg[infiniteIncludesOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class IncludesOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.includesOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorContains';
  }
}

@Component({
  selector: 'svg[infiniteStartsWithOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class StartsWithOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.startsWithOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorStartsWith';
  }
}

@Component({
  selector: 'svg[infiniteEndsWithOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class EndsWithOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.endsWithOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorEndsWith';
  }
}

@Component({
  selector: 'svg[infiniteEqualOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class EqualOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.eqOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorEq';
  }
}

@Component({
  selector: 'svg[infiniteNotEqualOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class NotEqualOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.neqOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorNeq';
  }
}

@Component({
  selector: 'svg[infiniteGTOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class GTOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.gtOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorGt';
  }
}

@Component({
  selector: 'svg[infiniteGTEOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class GTEOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.gteOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorGte';
  }
}

@Component({
  selector: 'svg[infiniteLTOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class LTOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.ltOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorLt';
  }
}

@Component({
  selector: 'svg[infiniteLTEOperatorIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class LTEOperatorIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.lteOperator;
  }
  protected override iconValue(): CustomizableIconName {
    return 'filterOperatorLte';
  }
}

@Component({
  selector: 'svg[infiniteDoneIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class DoneIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.done;
  }
  protected override iconValue(): CustomizableIconName {
    return 'done';
  }
}

@Component({
  selector: 'svg[infiniteClearIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: ICON_HOST,
  template: ICON_TEMPLATE,
})
export class ClearIcon extends IconBase {
  protected override pathsValue() {
    return iconPaths.clear;
  }
  protected override iconValue(): CustomizableIconName {
    return 'clear';
  }
}
