# Writing docs: demos and code

Every page is a `*.page.md` (MDX). Code in a page comes from files next to it, so it is type-checked against the library source and can't go stale.

## Live demos

A demo is a `*.demo.tsx` file with a default-exported component:

````md
```tsx file="basic-example.demo.tsx" title="Basic example"
```
````

- It is prebuilt into an iframe (`npm run build-demos`; `npm run dev` watches), and readers can edit and fork it.
- Files it imports with a relative path (`./columns`, `./data`) show up as extra tabs.
- `file="/docs/learn/sorting/x.demo.tsx"` (leading `/`) is relative to the `content` folder, for a demo that lives next to another page.
- The title goes in `title="…"`, and a description right before the fence:

  ````md
  <DemoDescription>

  Click a column header to change the sort.

  </DemoDescription>

  ```tsx file="sorting-example.demo.tsx" title="Sorting by age"
  ```
  ````

- `title="…"` is plain text, and a fence can't hold a backtick. For a title with markup (`code`, JSX), use a `<DemoTitle>` before the fence (and before the `<DemoDescription>`) instead:

  ````md
  <DemoTitle>Sorting by `age`</DemoTitle>

  ```tsx file="sorting-example.demo.tsx"
  ```
  ````

- `height="large"` (or `"small"`, a pixel number) changes the preview height.
- A demo named `*-tailwind.demo.tsx` gets Tailwind, on the docs page and in a fork, with the setup in `docs-kit.tailwind.css`.
- Keep a demo's file name once it is published: other pages, and its `*.demo.vue` sibling, refer to it.

## Code snippets

`ts`, `tsx` and `js` code can't be written inline in a page: the build fails. Put it in a `<page>.snippet.tsx` next to the page, between region comments, and reference the region:

```tsx
// sorting.snippet.tsx
import type { DataSourcePropSortInfo } from '@infinite-table/infinite-react';

type Developer = { id: number; firstName: string; age: number };

//#region sort-info
const sortInfo: DataSourcePropSortInfo<Developer> = [
  { field: 'age', dir: -1 }, // #highlight
  { field: 'firstName', dir: 1 },
];
//#endregion
```

````md
```ts file="sorting.snippet.tsx" region="sort-info" title="Sorting by two fields"
```
````

- The page shows only the lines of the region, dedented. Imports, types and `declare const data: Developer[]` that the reader doesn't need to see go outside the region.
- A region can sit anywhere: between statements, between the props of a JSX element, inside an object literal. Between JSX children, write it as `{/* #region name */}` … `{/* #endregion */}`.
- Highlight a line with a trailing `// #highlight`, or several with `// #highlight` … `// #endhighlight` lines. Between JSX children use `{/* #highlight */}`. `{1-3}` in the fence is not supported for these fences.
- Without `region`, the fence shows the whole file.

Code in other languages (`css`, `sh`, `json`, …) stays inline, and there `{2,5-7}` highlights lines and `title="…"` names the block.

## The Vue version of a page

A page is written once and shown for both frameworks: `/docs/...` for React, `/vue/docs/...` for Vue. The fences keep naming the React files; the Vue page shows their Vue siblings.

- **Frontmatter:** `vue: true` makes the page a Vue page. When the title or description says "React", give the Vue page its own:

  ```yaml
  vue:
    description: Learn how to configure filtering in Infinite Table for Vue
  ```

- **Demo:** `x.demo.vue` next to `x.demo.tsx`, showing the same grid. Without it, the Vue page shows the React demo with a "React only for now" notice.
- **Snippet:** `x.snippet.vue` (regions in `<script setup>` and in `<template>`) or `x.snippet.vue.ts` next to `x.snippet.tsx`, with every region the pages use from that file, under the same names. A missing region fails the build.
  - In a template the markers are HTML comments: `<!-- #region name -->` … `<!-- #endregion -->`, `<!-- #highlight -->`. A comment can't sit inside a start tag, so a region that slices the props of a JSX element becomes a whole element, or a `const` in the script with a comment showing how it is bound.
  - A region that is the same code in both frameworks (types, column objects without JSX, data) needs no sibling: add `neutral` to its fence, and the Vue page shows it from the `.tsx` file.

    ````md
    ```ts file="sorting.snippet.tsx" region="sort-info" neutral
    ```
    ````

- **Prose:** `@infinite-table/infinite-react` becomes `@infinite-table/infinite-vue` on the Vue page by itself. Anything else that is only true for one framework goes in a block (tags on their own lines, a blank line inside):

  ```md
  <FrameworkContent framework="react">

  Wrap the columns in `React.useMemo`, so the same object is passed on every render.

  </FrameworkContent>

  <FrameworkContent framework="vue">

  Define the columns in `<script setup>`, as a `const` or a `ref`.

  </FrameworkContent>
  ```

In a Vue demo:

- bind every prop, booleans included: `:lazyLoad="true"`. A bare attribute (`<DataSource lazyLoad>`) reaches the grid as `''` and counts as false;
- the `on*` props are props, not events: `:onSortInfoChange="onSortInfoChange"`;
- a function child of `<DataSource>` is its default slot: `<template #default="{ pivotColumns }">`;
- column functions (`render`, `renderValue`, `header`, …) return a string or VNodes from `h()`;
- composables (`useInfiniteColumnCell`, …) are called in the `setup` of a component, not directly in a column function: return `h(MyCell)` from the function;
- keep an instance of a state class (`GroupRowsState`, `RowSelectionState`, `TreeExpandState`, …) in a `shallowRef`;
- inline styles need their unit: `height: '500px'`.

## Checking your changes

Run these from the `www` folder:

| Command | What it does |
|---|---|
| `npm run tsc:content` | type-checks every React demo and snippet against `source/src` |
| `npm run tsc:vue` | the same for the Vue ones, with `vue-tsc` |
| `npm run build-demos` | builds every demo, React, Vue and Angular |
| `npm run check:demos` | opens every built demo in headless Chromium and reports the ones that don't render (`-- --framework vue` for only the Vue ones) |
| `npm run check:pages -- http://localhost:3001 content/docs/learn/sorting` | opens those pages on a running site and checks their demos |
| `npm run check:pages -- http://localhost:3001 content/docs/learn/sorting --framework vue` | the same for the Vue version of the pages, and lists the cards that still show React code |
| `npm run check:pages -- http://localhost:3001 content/docs/learn/sorting --color-scheme light` | the same with the browser preferring light (or `dark`) mode, which the site follows |

The `check:` ones use the Playwright install of the examples app (`npm ci --prefix examples`). CI runs the type checks and the demo build on every change under `www/content`.
