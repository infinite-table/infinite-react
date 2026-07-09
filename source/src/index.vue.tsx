/**
 * Public API entry for @infinite-table/infinite-vue.
 *
 * The Vue sibling of src/index.tsx - bundled by tsup.vue.config.ts with the
 * framework resolve plugin, so relative imports inside the graph prefer
 * `.vue.ts/.vue.tsx` siblings. Kept intentionally smaller than the React
 * entry while Vue parity is still in progress (see
 * plans/2026-07-08-multi-framework-architecture.md, Phase 3d).
 */
export { debounce } from './components/utils/debounce';

export {
  DataSource,
  useDataSourceContext,
  DataSourceInjectionKeyForVue,
} from './components/DataSource/DataSourceForVue.vue';

export {
  InfiniteTable,
  InfiniteTableClassName,
  InfiniteTableInjectionKeyForVue,
  useInfiniteTableContext,
} from './components/InfiniteTable/InfiniteTableForVue.vue';

export { Menu } from './components/Menu/MenuForVue.vue';
export { useOverlay } from './components/hooks/useOverlay/useOverlayForVue.vue';

export { useInfiniteColumnEditor } from './components/InfiniteTable/components/InfiniteTableRow/InfiniteTableColumnEditorForVue.vue';
export { useInfiniteColumnCell } from './components/InfiniteTable/components/InfiniteTableRow/InfiniteTableColumnCellForVue.vue';
export {
  createFlashingColumnCellComponent,
  FlashingColumnCell,
} from './components/InfiniteTable/components/InfiniteTableRow/FlashingColumnCellForVue.vue';
export {
  TreeGrid,
  TreeDataSource,
  toTreeDataArray,
  withSelectedLeafNodesOnly,
} from './components/TreeGrid/TreeGridForVue.vue';
export { InfiniteTableDetailRow } from './components/InfiniteTable/components/InfiniteTableRow/InfiniteTableDetailRowForVue.vue';
export { useGetMasterDetailContextForVue } from './components/DataSource/DataSourceMasterDetailContextForVue.vue';
export { useInfiniteHeaderCell } from './components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderCellForVue.vue';

import { InfiniteCheckBox } from './components/InfiniteTable/components/CheckBoxForVue.vue';
import { LoadMask } from './components/InfiniteTable/components/LoadMaskForVue.vue';
import { MenuIcon } from './components/InfiniteTable/components/icons/MenuIconForVue.vue';

export const components = {
  CheckBox: InfiniteCheckBox,
  LoadMask,
  MenuIcon,
};

export { group, flatten } from './utils/groupAndPivot';
export { DeepMap } from './utils/DeepMap';

// type-only star export: the types barrel has runtime imports that reach
// React-only modules, so it must be fully erased from the Vue bundle
export type * from './components/InfiniteTable/types';
export type {
  DataSourceApi,
  DataSourceData,
  DataSourcePropGroupBy,
  DataSourcePropSortInfo,
  DataSourceSingleSortInfo,
  DataSourceState,
} from './components/DataSource/types';
