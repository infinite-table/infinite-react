---
title: Theming
description: Read our docs on the available themes and how you can customize the look and feel of InfiniteTable for React.
---

`<InfiniteTable />` ships with a CSS file that you need to import in your codebase to make the component look as intended.

```ts
import '@infinite-table/infinite-react/index.css';
```

This file includes both the **`light`** and the **`dark`** themes.


At runtime, the `light` or `dark` theme are applied based on the user OS settings for the [preferred color scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme). 



To explicitly apply the light theme, apply the className `"light"` (or `"infinite-light"`) to any parent element of the `<InfiniteTable />` component.

To explicitly apply the dark theme, apply the className `"dark"` (or `"infinite-dark"`) to any parent element of the `<InfiniteTable />` component.



```tsx title="explicitly-apply-light-theme-via-container-className"
<div className="light">
  <DataSource {...dataSouceProps}>
    <InfiniteTable {...props} />
  </DataSource>
</div>
```


If instead you specify a `dark` CSS className, the dark theme will be applied

```tsx title="explicitly-apply-dark-theme-via-container-className"
<body className="dark">
  <div>
    <DataSource {...dataSouceProps}>
      <InfiniteTable {...props} />
    </DataSource>
  </div>
</body>
```

<Sandpack title="Theme switching demo - default to light theme">

```ts file="theme-switching-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>

<Note>

If you don't explicitly have a `light` or `dark` ancestor, `InfiniteTable` will use the browser/OS preference (via `@media (prefers-color-scheme: ...)`) to apply the dark or light theme.

</Note>
