import { IncludesOperatorIcon } from '../InfiniteTable/components/icons/IncludesOperatorIcon';
import { EndsWithOperatorIcon } from '../InfiniteTable/components/icons/EndsWithOperatorIcon';
import { EqualOperatorIcon } from '../InfiniteTable/components/icons/EqualOperatorIcon';
import { GTEOperatorIcon } from '../InfiniteTable/components/icons/GTEOperatorIcon';
import { GTOperatorIcon } from '../InfiniteTable/components/icons/GTOperatorIcon';
import { LTEOperatorIcon } from '../InfiniteTable/components/icons/LTEOperatorIcon';
import { LTOperatorIcon } from '../InfiniteTable/components/icons/LTOperatorIcon';
import { NotEqualOperatorIcon } from '../InfiniteTable/components/icons/NotEqualOperatorIcon';
import { StartsWithOperatorIcon } from '../InfiniteTable/components/icons/StartsWithOperatorIcon';
import {
  NumberFilterEditor,
  StringFilterEditor,
} from '../InfiniteTable/components/FilterEditors';
import { getDefaultFilterTypes } from './defaultFilterTypesShared';

export const defaultFilterTypes = getDefaultFilterTypes<any>({
  StringFilterEditor,
  NumberFilterEditor,
  icons: {
    includes: IncludesOperatorIcon,
    eq: EqualOperatorIcon,
    neq: NotEqualOperatorIcon,
    startsWith: StartsWithOperatorIcon,
    endsWith: EndsWithOperatorIcon,
    gt: GTOperatorIcon,
    gte: GTEOperatorIcon,
    lt: LTOperatorIcon,
    lte: LTEOperatorIcon,
  },
});
