---
title: Theming
description: Read our docs on the available themes and how you can customize the look and feel of InfiniteTable for React.
---

`<InfiniteTable />` ships with a CSS file that you need to import in your codebase to make the component look as intended.

```ts
import '@infinite-table/infinite-react/index.css';
```

This file includes the following themes:
  - `default`
  - `minimalist`
  - `ocean`
  - `balsam`

Each of them in both the **`light`** and the **`dark`** modes.

## Theme mode - light or dark

At runtime, the `light` or `dark` mode is applied based on the user OS settings for the [preferred color scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).

To explicitly apply the light mode, apply the className `"infinite-theme-mode--light"` to any parent element of the `<InfiniteTable />` component.

To explicitly apply the dark mode, apply the className `"infinite-theme-mode--dark"` to any parent element of the `<InfiniteTable />` component.

```tsx title="Explicitly applying light mode via container className"
<div className="infinite-theme-mode--light">
  <DataSource {...dataSouceProps}>
    <InfiniteTable {...props} />
  </DataSource>
</div>
```

If instead you specify a `infinite-theme-mode--dark` CSS className, the dark mode will be applied

```tsx title="Explicitly applying dark theme via container className"
<body className="infinite-theme-mode--dark">
  <div>
    <DataSource {...dataSouceProps}>
      <InfiniteTable {...props} />
    </DataSource>
  </div>
</body>
```

<Sandpack title="Theme switching demo - defaults to light theme" size="md" viewMode="preview">

<Description>

Example configured with `default` theme and `light` mode by default.
</Description>

```ts file="theme-switching-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>

<Note>

If you don't explicitly have a `infinite-theme-mode--light` or `infinite-theme-mode--dark` ancestor, `InfiniteTable` will use the browser/OS preference (via `@media (prefers-color-scheme: ...)`) to apply the dark or light theme.

</Note>

## Available themes

### Default theme

The `default` theme is applied when you don't specify any explicit theme by default.

### Minimalist theme

The `minimalist` theme is inspired from minimalistic designs and is a good choice if you want to keep the UI simple and clean.

## Applying the theme

To apply a theme, you have to set the className `"infinite-theme-name--THEME_NAME"` to any parent element of the `<InfiniteTable />` component (or even on the component itself).

You will want to apply the theme name and theme mode classNames to the same element, so you'll end up with a className like `"infinite-theme-name--minimalist infinite-theme-mode--dark"`.

```tsx title="Applying the minimalist theme with dark mode explicitly"
<body className="infinite-theme-mode--dark infinite-theme-name--minimalist">
  <DataSource {...dataSouceProps}>
    <InfiniteTable {...props} />
  </DataSource>
</body>
```



<Sandpack title="Theme switching demo - defaults to minimalist theme in dark mode" size="md" viewMode="preview">

<Description>

Example configured with `minimalist` theme and `dark` mode by default.
</Description>
```ts file="theme-switching-minimalist-theme-default-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>