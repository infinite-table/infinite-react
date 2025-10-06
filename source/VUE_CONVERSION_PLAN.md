# InfiniteTable Vue Conversion - Side-by-Side Approach

## Overview
This document outlines the strategy for creating Vue.js components alongside the existing React components in the same codebase, sharing all TypeScript utilities, types, and business logic.

## Architecture Principles

### 1. Side-by-Side Components
- Vue components (`.vue`) are placed alongside React components (`.tsx`)
- All TypeScript files (`.ts`) remain untouched and are shared between React and Vue
- CSS-in-TS files are reused exactly as-is
- Only component logic is duplicated, all business logic is shared

### 2. File Naming Convention
```
source/src/components/Component/
├── Component.tsx           # React component
├── Component.vue           # Vue component (NEW)
├── Component.css.ts        # Shared CSS (UNCHANGED)
├── types.ts               # Shared types (UNCHANGED)
└── utils.ts               # Shared utilities (UNCHANGED)
```

### 3. Hook/Composable Convention
```
source/src/components/hooks/
├── useHook.tsx            # React hook
├── useHook.vue.ts         # Vue composable (NEW)
└── shared-logic.ts        # Shared logic (UNCHANGED)
```

## Current Progress

### ✅ Completed Components (4/93)

#### LoadMask
- **React**: `source/src/components/InfiniteTable/components/LoadMask.tsx`
- **Vue**: `source/src/components/InfiniteTable/components/LoadMask.vue`
- **Shared**: CSS and types from existing files

#### CheckBox  
- **React**: `source/src/components/InfiniteTable/components/CheckBox.tsx`
- **Vue**: `source/src/components/InfiniteTable/components/CheckBox.vue`
- **Shared**: Uses existing `InfiniteCheckBoxProps` and `InfiniteCheckBoxPropChecked` types

#### StringFilterEditor
- **React**: Part of `FilterEditors.tsx`
- **Vue**: `source/src/components/InfiniteTable/components/StringFilterEditor.vue`
- **Composable**: `useInfiniteColumnFilterEditor.vue.ts`

#### NumberFilterEditor
- **React**: Part of `FilterEditors.tsx`  
- **Vue**: `source/src/components/InfiniteTable/components/NumberFilterEditor.vue`
- **Composable**: Shares `useInfiniteColumnFilterEditor.vue.ts`

### ✅ Vue Composables Created

#### useLatest
- **React**: `source/src/components/hooks/useLatest.tsx`
- **Vue**: `source/src/components/hooks/useLatest.vue.ts`

#### useInfiniteColumnFilterEditor
- **React**: Function in `InfiniteTableColumnHeaderFilter.tsx`
- **Vue**: `source/src/components/InfiniteTable/components/InfiniteTableHeader/useInfiniteColumnFilterEditor.vue.ts`

## Component Conversion Examples

### Simple Presentational Component
```vue
<!-- LoadMask.vue -->
<template>
  <div :class="computedClasses">
    <slot>{{ children }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LoadMaskCls } from './LoadMask.css'; // SHARED CSS
import { LoadMaskProps } from '../types/InfiniteTableProps'; // SHARED TYPES

interface Props extends LoadMaskProps {
  visible: boolean;
}

const props = defineProps<Props>();
const computedClasses = computed(() => LoadMaskCls[props.visible ? 'visible' : 'hidden']);
</script>
```

### Stateful Component with Events
```vue
<!-- CheckBox.vue -->
<template>
  <input 
    type="checkbox" 
    :checked="!!checked"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { InfiniteCheckBoxProps } from './CheckBox'; // SHARED TYPES

interface Props extends InfiniteCheckBoxProps {}
const props = defineProps<Props>();

const emit = defineEmits<{
  change: [checked: boolean | null];
}>();

const handleChange = () => {
  emit('change', !props.checked);
};
</script>
```

### Vue Composable (Hook Equivalent)
```typescript
// useLatest.vue.ts
import { ref } from 'vue';

export function useLatest<T>(value: T): () => T {
  const valueRef = ref(value);
  valueRef.value = value;
  return () => valueRef.value;
}
```

## Export Strategy

### Vue-Specific Index File
- **File**: `source/src/index.vue.ts`
- **Purpose**: Exports Vue components alongside shared utilities
- **Pattern**: Imports `.vue` files and re-exports them

```typescript
// index.vue.ts
import LoadMaskVue from './components/InfiniteTable/components/LoadMask.vue';
import CheckBoxVue from './components/InfiniteTable/components/CheckBox.vue';

export const components = {
  LoadMask: LoadMaskVue,
  CheckBox: CheckBoxVue,
};

// All utilities and types are shared
export { DeepMap } from './utils/DeepMap'; // SHARED
export * from './components/InfiniteTable/types'; // SHARED
```

## Build Strategy

### Dual Package Output
1. **React Package**: Uses existing `index.tsx` → builds to `@infinite-table/infinite-react`
2. **Vue Package**: Uses new `index.vue.ts` → builds to `@infinite-table/infinite-vue`
3. **Shared Code**: All `.ts` files are included in both packages

### TypeScript Configuration
- Existing `tsconfig.json` works for both React and Vue
- Vue SFC support added via Vue compiler
- No changes needed to existing TS files

## Conversion Progress

### Next Priority Components (High Impact)
1. **DataSource** - Core data management
2. **VirtualList** - Performance-critical virtualization  
3. **InfiniteTable main component** - Root component
4. **InfiniteTableHeader components** - Column management
5. **InfiniteTableRow components** - Row rendering

### Conversion Strategy Per Component Type

#### Simple Components (like LoadMask)
1. Create `.vue` file alongside `.tsx`
2. Convert JSX template to Vue template
3. Convert props to `defineProps`
4. Convert callbacks to `defineEmits`
5. Import shared CSS and types

#### Complex State Components (like DataSource)
1. Create Vue composable for hook logic in `.vue.ts` file
2. Create `.vue` component that uses the composable
3. Ensure provide/inject for context equivalent
4. Maintain exact same state shape and behavior

#### Hook-Heavy Components
1. Create Vue composable versions of hooks in `.vue.ts` files
2. Mirror exact hook interfaces and return values
3. Use Vue's `ref`, `reactive`, `computed`, `watch` as equivalents
4. Maintain same performance characteristics

## Testing Strategy
- Vue components tested alongside React components
- Shared utilities tested once (benefit both frameworks)
- Component behavior tests ensure parity between React and Vue versions
- Performance tests ensure Vue components match React performance

## Benefits of This Approach

1. **No Code Duplication**: All business logic, utilities, and types shared
2. **Gradual Migration**: Can convert components incrementally  
3. **Consistent API**: Vue components have identical props and behavior
4. **Shared Maintenance**: Bug fixes and features benefit both versions
5. **Type Safety**: Full TypeScript support across both frameworks
6. **Performance**: Same optimizations apply to both versions

## Remaining Work

- **89 components** still need Vue versions
- **Complex state management** systems need Vue composable equivalents
- **Context providers** need provide/inject implementations  
- **Performance-critical components** need careful Vue optimization
- **Build pipeline** needs dual-package configuration
- **Documentation** and examples for Vue usage

The foundation is established and the pattern is proven. The remaining work is systematic conversion following the established side-by-side approach.