# InfiniteTable Vue Conversion Plan

## Overview
This document outlines the strategy for converting the InfiniteTable React DataGrid component to Vue.js while maintaining the same API and functionality.

## Architecture Principles

### 1. Shared TypeScript Code
- All TypeScript utility functions, types, and business logic remain unchanged
- CSS-in-TS styles are reused as-is
- Only React-specific component code needs conversion

### 2. Component Structure
- React TSX components → Vue SFC (.vue) components
- Maintain the same component hierarchy and file structure
- Keep the same export patterns via TypeScript index files

### 3. State Management Conversion
- React hooks → Vue Composition API
- `useState` → `ref` or `reactive`
- `useEffect` → `watch`, `onMounted`, `onUnmounted`
- `useCallback`/`useMemo` → `computed`
- `useRef` → `ref`
- Context API → `provide`/`inject`

### 4. Event Handling
- React event props (`onClick`, `onChange`) → Vue event listeners (`@click`, `@change`)
- Custom React events → Vue `emit` system

## Conversion Progress

### ✅ Completed Components
1. **LoadMask** (`source-vue/src/components/InfiniteTable/components/LoadMask.vue`)
   - Simple component with props and conditional rendering
   - Uses slots for content

2. **CheckBox** (`source-vue/src/components/InfiniteTable/components/CheckBox.vue`)
   - Input component with three-state logic (true/false/null)
   - Uses Vue's reactive system and watchers

### 🔄 Core Components to Convert

#### High Priority (Core Functionality)
1. **InfiniteTable** (`source/src/components/InfiniteTable/index.tsx`)
   - Main component wrapper
   - Context provider conversion to Vue's provide/inject

2. **DataSource** (`source/src/components/DataSource/index.tsx`)
   - Data management and state
   - Complex state management requiring reactive system

3. **VirtualList** (`source/src/components/VirtualList/VirtualList.tsx`)
   - Core virtualization logic
   - Performance-critical scrolling

4. **InfiniteTableHeader** (`source/src/components/InfiniteTable/components/InfiniteTableHeader/`)
   - Column headers and sorting
   - Event handling for user interactions

5. **InfiniteTableRow** (`source/src/components/InfiniteTable/components/InfiniteTableRow/`)
   - Row rendering and cell components
   - Key for data display

#### Medium Priority (Enhanced Features)
6. **ResizeObserver** (`source/src/components/ResizeObserver/index.tsx`)
7. **Menu** (`source/src/components/Menu/`)
8. **FilterEditors** (`source/src/components/InfiniteTable/components/FilterEditors.tsx`)
9. **TreeGrid** (`source/src/components/TreeGrid/`)

#### Lower Priority (Utilities and Helpers)
10. Various utility components and icons
11. DevTools integration
12. Theme components

## Conversion Strategies by Component Type

### Simple Presentational Components
- Direct template conversion
- Props interface mapping
- Event emission setup

**Example Pattern:**
```vue
<template>
  <div :class="computedClass">
    <slot>{{ children }}</slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Original React props
}
const props = defineProps<Props>();
const emit = defineEmits<{
  // Original React callbacks as emit events
}>();
</script>
```

### Stateful Components with Hooks
- `useState` → `ref`/`reactive`
- `useEffect` → `watch`/lifecycle hooks
- Context → `provide`/`inject`

### Complex State Management Components
- May require custom composables
- Maintain same state shape and transitions
- Convert reducer patterns to reactive state

## Build Configuration

### Package Structure
```
source-vue/
├── src/
│   ├── components/           # Vue components
│   │   ├── InfiniteTable/   # Main table components
│   │   ├── DataSource/      # Data management
│   │   └── ...              # Other component folders
│   ├── utils/               # Shared utilities (copied from React)
│   └── index.ts             # Main export
├── package.json             # Vue-specific dependencies
└── tsconfig.json            # TypeScript configuration
```

### Dependencies
- Vue 3.4+ (Composition API)
- TypeScript 5.7.2
- Same CSS-in-JS tooling (@vanilla-extract)
- Same build tools (tsup, esbuild)

## Testing Strategy
- Reuse existing test logic where possible
- Convert React Testing Library tests to Vue Test Utils
- Maintain same test coverage and scenarios

## Next Steps
1. Convert DataSource component (complex state management)
2. Convert VirtualList (performance critical)
3. Convert InfiniteTable main component
4. Convert header and row components
5. Set up build pipeline and testing
6. Create examples and documentation

## File Naming Conventions
- Vue components: `ComponentName.vue`
- Export files: `ComponentName.ts` (imports and re-exports the .vue file)
- Types: Share the same TypeScript files from React version
- Styles: Share the same CSS-in-TS files

## API Compatibility
The Vue version maintains the same public API as the React version:
- Same prop names and types
- Same event callback signatures
- Same utility function exports
- Same CSS class names and theming