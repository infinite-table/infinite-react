# @infinite-table/infinite-vue

Vue.js version of the InfiniteTable DataGrid component.

## Overview

This package provides a Vue 3 implementation of InfiniteTable, maintaining the same API and functionality as the React version while leveraging Vue's Composition API and reactivity system.

## Status

🚧 **Work in Progress** - Currently in active development

### ✅ Completed Components

- **LoadMask** - Loading overlay component
- **CheckBox** - Three-state checkbox component (true/false/null) 
- **StringFilterEditor** - Text input filter for columns
- **NumberFilterEditor** - Numeric input filter for columns

### 🔄 In Development

- **DataSource** - Core data management component
- **VirtualList** - Virtualized scrolling implementation
- **InfiniteTable** - Main table component
- **InfiniteTableHeader** - Column headers with sorting/filtering
- **InfiniteTableRow** - Row rendering and cell components

## Installation

```bash
npm install @infinite-table/infinite-vue
```

## Basic Usage

```vue
<template>
  <div>
    <!-- Basic DataGrid -->
    <DataSource 
      :data="data" 
      :primaryKey="primaryKey"
    >
      <InfiniteTable :columns="columns" />
    </DataSource>
    
    <!-- With loading state -->
    <LoadMask :visible="isLoading">
      Loading data...
    </LoadMask>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DataSource, InfiniteTable, LoadMask } from '@infinite-table/infinite-vue';

const data = ref([
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
  // ... more data
]);

const columns = {
  name: { field: 'name', header: 'Name' },
  age: { field: 'age', header: 'Age', type: 'number' }
};

const primaryKey = 'id';
const isLoading = ref(false);
</script>
```

## Component API

### LoadMask

A loading overlay component with customizable content.

```vue
<LoadMask :visible="isLoading">
  <slot>Loading...</slot>
</LoadMask>
```

**Props:**
- `visible: boolean` - Controls overlay visibility
- `children?: string` - Default loading text

### CheckBox

Three-state checkbox component supporting true, false, and indeterminate (null) states.

```vue
<InfiniteCheckBox 
  :checked="checked" 
  :disabled="disabled"
  @change="handleChange"
/>
```

**Props:**
- `checked?: true | false | null` - Checkbox state
- `disabled?: boolean` - Disabled state
- `domProps?: Record<string, any>` - Additional DOM properties

**Events:**
- `@change: (checked: true | false | null) => void`

### Filter Editors

Input components for column filtering.

```vue
<!-- String filter -->
<StringFilterEditor />

<!-- Number filter -->
<NumberFilterEditor />
```

## Architecture

### Design Principles

1. **Shared Logic**: TypeScript utilities, types, and business logic are shared between React and Vue versions
2. **Component Parity**: Vue components maintain the same props and behavior as React components  
3. **Vue Patterns**: Uses Vue 3 Composition API, reactive refs, and single-file components
4. **Performance**: Maintains the same virtualization and performance optimizations

### Key Differences from React Version

| Aspect | React | Vue |
|--------|--------|-----|
| State | `useState` | `ref`, `reactive` |
| Effects | `useEffect` | `watch`, `onMounted` |
| Context | React Context | `provide`/`inject` |
| Events | Props callbacks | `emit` events |
| Templates | JSX | Vue templates |

### File Structure

```
source-vue/
├── src/
│   ├── components/
│   │   ├── InfiniteTable/     # Main table components
│   │   │   ├── index.vue      # Main InfiniteTable component  
│   │   │   ├── components/    # Sub-components
│   │   │   │   ├── LoadMask.vue
│   │   │   │   ├── CheckBox.vue
│   │   │   │   └── ...
│   │   │   └── types/         # Shared TypeScript types
│   │   ├── DataSource/        # Data management
│   │   ├── VirtualList/       # Virtualization
│   │   └── hooks/             # Vue composables
│   ├── utils/                 # Shared utilities
│   └── index.ts               # Main exports
├── example-usage.vue          # Usage examples
├── CONVERSION_PLAN.md         # Detailed conversion strategy
└── README.md                  # This file
```

## Development

### Prerequisites

- Vue 3.4+
- TypeScript 5.7+
- Node.js 18+

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

## Contributing

This Vue version aims to maintain 100% API compatibility with the React version. When contributing:

1. Keep the same component interfaces and prop names
2. Maintain the same CSS classes and styling  
3. Preserve the same event callback signatures
4. Follow Vue 3 Composition API patterns
5. Add comprehensive TypeScript types

## Roadmap

### Phase 1: Core Components ✅
- [x] LoadMask
- [x] CheckBox  
- [x] FilterEditors

### Phase 2: Data Layer 🔄
- [ ] DataSource component
- [ ] State management composables
- [ ] Data loading and caching

### Phase 3: Virtualization 📋
- [ ] VirtualList implementation
- [ ] VirtualScrollContainer
- [ ] Performance optimizations

### Phase 4: Table Components 📋
- [ ] InfiniteTable main component
- [ ] Table headers with sorting
- [ ] Table rows and cells
- [ ] Column resizing

### Phase 5: Advanced Features 📋
- [ ] TreeGrid for hierarchical data
- [ ] Menu components
- [ ] Advanced filtering
- [ ] Column grouping and pivoting

### Phase 6: Polish 📋
- [ ] Complete test suite
- [ ] Documentation and examples
- [ ] Performance benchmarks
- [ ] Bundle size optimization

## License

Commercial & Open Source - Same as React version

## Support

For issues and questions:
- GitHub Issues: [infinite-table/infinite-react](https://github.com/infinite-table/infinite-react/issues)
- Documentation: [infinite-table.com](https://infinite-table.com)
- Email: admin@infinite-table.com