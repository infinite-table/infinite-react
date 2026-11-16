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
- A demo named `*-tailwind.demo.tsx` gets Tailwind, with the setup in `docs-kit.tailwind.css`.
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

## Checking your changes

Run these from the `www` folder:

| Command | What it does |
|---|---|
| `npm run tsc:content` | type-checks every demo and snippet against `source/src` |
| `npm run build-demos` | builds every demo |
| `npm run check:demos` | opens every built demo in headless Chromium and reports the ones that don't render |
| `npm run check:pages -- http://localhost:3001 content/docs/learn/sorting` | opens those pages on a running site and checks their demos |

The last two use the Playwright install of the examples app (`npm ci --prefix examples`). CI runs the first two on every change under `www/content`.
