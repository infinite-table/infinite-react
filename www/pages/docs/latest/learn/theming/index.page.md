---
title: Theming
---

Infinite Table ships with a CSS file that you need to import in your codebase to make the component look as intended.

```ts
import '@infinite-table/infinite-react/index.css';
```

The above CSS file includes both the **`light`** and the **`dark`** theme. By default, the `light` theme is applied - or, if you include the component in a container with the `light` CSS className.

```tsx title=explicitly-apply-light-theme-via-container-className
<div className="light">
  <DataSource {...dataSouceProps}>
    <InfiniteTable {...props} />
  </DataSource>
</div>
```

<Gotcha>

The `light` or `dark` CSS classes don't need to be specified on the direct parent - they can (and usually are) be applied on the document element (`<html />`) or the `<body />` element.

</Gotcha>

If instead you specify a `dark` CSS className, the dark theme will be applied

```tsx title=explicitly-apply-dark-theme-via-container-className
<body className="dark">
  <div>
    <DataSource {...dataSouceProps}>
      <InfiniteTable {...props} />
    </DataSource>
  </div>
</body>
```

<Sandpack>

```ts file=theme-switching-example.page.tsx

```

```ts file=columns.ts

```

</Sandpack>

<Note>

If you don't explicitly have a `light` or `dark` ancestor, `InfiniteTable` will use the browser/OS preference (via `@media (prefers-color-scheme: dark)`) to apply the dark or light theme.

</Note>
