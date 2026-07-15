import {
  StringFilterEditor,
  NumberFilterEditor,
} from '../InfiniteTable/components/FilterEditorsForVue.vue';
import {
  IncludesOperatorIcon,
  EqualOperatorIcon,
  NotEqualOperatorIcon,
  StartsWithOperatorIcon,
  EndsWithOperatorIcon,
  GTOperatorIcon,
  GTEOperatorIcon,
  LTOperatorIcon,
  LTEOperatorIcon,
} from '../InfiniteTable/components/icons/IconForVue.vue';
import { getDefaultFilterTypes } from './defaultFilterTypesShared';

/**
 * Vue sibling of defaultFilterTypes: same filter functions/operators, with
 * the Vue filter editors and operator icons.
 */
export const defaultFilterTypes = getDefaultFilterTypes<any>({
  StringFilterEditor: StringFilterEditor as any,
  NumberFilterEditor: NumberFilterEditor as any,
  icons: {
    includes: IncludesOperatorIcon as any,
    eq: EqualOperatorIcon as any,
    neq: NotEqualOperatorIcon as any,
    startsWith: StartsWithOperatorIcon as any,
    endsWith: EndsWithOperatorIcon as any,
    gt: GTOperatorIcon as any,
    gte: GTEOperatorIcon as any,
    lt: LTOperatorIcon as any,
    lte: LTEOperatorIcon as any,
  },
});
