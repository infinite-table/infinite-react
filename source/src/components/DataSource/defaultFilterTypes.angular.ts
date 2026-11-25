import type { Type } from '@angular/core';

import { renderComponent } from '../RawList/InfiniteRenderForAngular.angular';
import {
  NumberFilterEditor,
  StringFilterEditor,
} from '../InfiniteTable/components/FilterEditorsForAngular.angular';
import {
  EndsWithOperatorIcon,
  EqualOperatorIcon,
  GTEOperatorIcon,
  GTOperatorIcon,
  IncludesOperatorIcon,
  LTEOperatorIcon,
  LTOperatorIcon,
  NotEqualOperatorIcon,
  StartsWithOperatorIcon,
} from '../InfiniteTable/components/icons/FilterOperatorIconsForAngular.angular';
import { getDefaultFilterTypes } from './defaultFilterTypesShared';

// the shared signature: `components.Icon(props)` returns a Renderable (the
// operator switch passes `{ size, className }`)
const icon = (Icon: Type<unknown>) => (props?: Record<string, unknown>) =>
  renderComponent(Icon, props ? { inputs: props } : undefined);

/**
 * Angular sibling of defaultFilterTypes: same filter functions/operators,
 * with the Angular filter editors and operator icons.
 */
export const defaultFilterTypes = getDefaultFilterTypes<any>({
  StringFilterEditor: () => renderComponent(StringFilterEditor),
  NumberFilterEditor: () => renderComponent(NumberFilterEditor),
  icons: {
    includes: icon(IncludesOperatorIcon),
    eq: icon(EqualOperatorIcon),
    neq: icon(NotEqualOperatorIcon),
    startsWith: icon(StartsWithOperatorIcon),
    endsWith: icon(EndsWithOperatorIcon),
    gt: icon(GTOperatorIcon),
    gte: icon(GTEOperatorIcon),
    lt: icon(LTOperatorIcon),
    lte: icon(LTEOperatorIcon),
  },
});
