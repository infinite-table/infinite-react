// Vue version exports - mirrors the React index.tsx but with Vue components
export { debounce } from './utils/debounce';
export * from './components/InfiniteTable';
export * from './components/TreeGrid';

export * from './components/DataSource';
export { useDataSourceInternal } from './components/DataSource/privateHooks/useDataSource';
export * from './components/DataSource/DataLoader/DataClient';

export * from './components/Menu';
export * from './components/Menu/MenuProps';

export * from './components/hooks/useOverlay';
export * from './components/hooks/useEffectWithChanges';

// Vue components
import LoadMaskVue from './components/InfiniteTable/components/LoadMask.vue';
import CheckBoxVue from './components/InfiniteTable/components/CheckBox.vue';
import StringFilterEditorVue from './components/InfiniteTable/components/StringFilterEditor.vue';
import NumberFilterEditorVue from './components/InfiniteTable/components/NumberFilterEditor.vue';

// Import MenuIcon from React version for now
import { MenuIcon } from './components/InfiniteTable/components/icons/MenuIcon';

export { keyboardShortcuts } from './components/InfiniteTable/eventHandlers/keyboardShortcuts';
export { type MenuIconProps } from './components/InfiniteTable/components/icons/MenuIcon';

export const components = {
  CheckBox: CheckBoxVue,
  LoadMask: LoadMaskVue,
  MenuIcon, // React version for now
  StringFilterEditor: StringFilterEditorVue,
  NumberFilterEditor: NumberFilterEditorVue,
};

export { group, flatten } from './utils/groupAndPivot';

export {
  useManagedComponentState as useComponentState,
  buildManagedComponent as getComponentStateRoot,
} from './components/hooks/useComponentState';

export { interceptMap } from './components/hooks/useInterceptedMap';

export { DeepMap } from './utils/DeepMap';
export { FixedSizeSet } from './utils/FixedSizeSet';
export { WeakFixedSizeSet } from './utils/WeakFixedSizeSet';
export { debug, type DebugLogger } from './utils/debugPackage';

export { useEffectWithChanges } from './components/hooks/useEffectWithChanges';

export { useEffectWhenSameDeps } from './components/hooks/useEffectWhenSameDeps';
export { useEffectWhen } from './components/hooks/useEffectWhen';
export { usePrevious } from './components/hooks/usePrevious';

export { defaultFilterTypes } from './components/DataSource/defaultFilterTypes';

export {
  createFlashingColumnCellComponent,
  FlashingColumnCell,
} from './components/InfiniteTable/components/InfiniteTableRow/FlashingColumnCell';