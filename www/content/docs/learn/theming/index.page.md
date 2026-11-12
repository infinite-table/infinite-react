---
title: Theming
description: Read our docs on the available themes and how you can customize the look and feel of InfiniteTable for React.
---

`<InfiniteTable />` ships with a CSS file that you need to import in your codebase to make the component look as intended.

```ts file="index.snippet.tsx" region="intro"
```

This root CSS file includes the `"default"` theme.

The other available themes are

  - `shadcn`
  - `minimalist`
  - `ocean`
  - `balsam`
  - `terminal`
  - `sheet`
  - `paper`

and if you want to use any of them, you have to import their respective CSS file explicitly:

```ts file="index.snippet.tsx" region="theme-css-imports"
```

Each theme CSS file includes both the **`light`** and the **`dark`** modes.

<Note>

Version `6.2.0` is the first version where the root CSS file (`@infinite-table/infinite-react/index.css`) doesn't include all the themes. Previous to this version, simply importing the root CSS file gave you access to all available themes.

Splitting each theme into a dedicated CSS file helps reduce the bundle size for our users, as most people will only use one theme for `<InfiniteTable />` in their apps.

</Note>

## Applying a theme

The following themes are currently available:

 - `default` - applied by default, no special configuration needed. It's included in the root CSS you need to import from `@infinite-table/infinite-react/index.css`
 - `balsam`
 - `minimalist`
 - `ocean`
 - `terminal`
 - `sheet`
 - `paper`
 - `shadcn` - for this theme to correctly show up, make sure the shadcn CSS vars are available on page - see [shadcn theming](https://ui.shadcn.com/docs/theming) for details


To apply a theme (except the default one), you have to set the className `"infinite-theme-name--THEME_NAME"` to any parent element of the `<InfiniteTable />` component (or even on the component itself).

You will want to apply the theme name and theme mode classNames to the same element, so you'll end up with a className like `"infinite-theme-name--minimalist infinite-theme-mode--dark"`.

```tsx file="index.snippet.tsx" region="applying-the-minimalist-theme-with-dark-mode" title="Applying the minimalist theme with dark mode explicitly"
```



<DemoTitle>Theme switching demo - defaults to minimalist theme in dark mode</DemoTitle>
<DemoDescription>

Example configured with `minimalist` theme and `dark` mode by default.

</DemoDescription>

```tsx file="theme-switching-minimalist-theme-default-example.demo.tsx"
```


## Theme mode - light or dark

At runtime, the `light` or `dark` mode is applied based on the user OS settings for the [preferred color scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).

To explicitly apply the light mode, apply the className `"infinite-theme-mode--light"` to any parent element of the `<InfiniteTable />` component.

To explicitly apply the dark mode, apply the className `"infinite-theme-mode--dark"` to any parent element of the `<InfiniteTable />` component.

```tsx file="index.snippet.tsx" region="explicitly-applying-light-mode-via-container" title="Explicitly applying light mode via container className"
```

If instead you specify a `infinite-theme-mode--dark` CSS className, the dark mode will be applied

```tsx file="index.snippet.tsx" region="explicitly-applying-dark-theme-via-container" title="Explicitly applying dark theme via container className"
```


<Description>
Example configured with `default` theme and `light` mode by default.
</Description>

```tsx file="theme-switching-example.demo.tsx" title="Theme switching demo - defaults to light theme"
```

<Note>

If you don't explicitly have a `infinite-theme-mode--light` or `infinite-theme-mode--dark` ancestor, `InfiniteTable` will use the browser/OS preference (via `@media (prefers-color-scheme: ...)`) to apply the dark or light theme.

</Note>

## Density

Density is independent of the theme, and works with any of them. Apply one of the following classNames to the `<InfiniteTable />` component, or to any of its parent elements:

- `infinite-density--compact`
- `infinite-density--comfortable` - the default
- `infinite-density--spacious`

```tsx file="index.snippet.tsx" region="using-the-compact-density" title="Using the compact density"
```

The density scales the sizes defined by the theme: the row height, the column header height, the cell and header cell paddings, the spacing of the menu items (column menu, context menus, filter operator menu), of the column filter editors and of the grouping toolbar items, and (slightly) the font size. Since it's relative to the theme, a dense theme with the `compact` density is denser still.

<Note>

The density changes the row height and the column header height only when you don't specify the <PropLink name="rowHeight" /> and <PropLink name="columnHeaderHeight" /> props - in this case, they come from the `--infinite-row-height` and `--infinite-column-header-height` CSS variables of the theme, multiplied by the density.

Similarly, if you specify `--infinite-cell-padding` (or `--infinite-header-cell-padding`), it's used as is. To have the paddings scaled by the density, specify `--infinite-cell-padding-x` and `--infinite-cell-padding-y` instead.

The spacings that can be specified as shorthands with multiple values (`--infinite-menu-padding`, `--infinite-grouping-toolbar-padding` and `--infinite-grouping-toolbar-gap`) are not scaled by the density - they're left to the theme.

</Note>

Under the hood, the density classNames set the `--infinite-density-scale` CSS variable - `0.8` for `compact`, `1` for `comfortable` and `1.2` for `spacious`. You can also set it to any other value.

```css title="A custom density"
.my-app {
  --infinite-density-scale: 0.9;
}
```

```tsx file="density-example.demo.tsx" title="Changing the density"
```

## Icons

The icons of `<InfiniteTable />` can be replaced via CSS - every icon has a CSS variable that you can set to an image, typically an SVG data URI.

```css title="Replacing the expand/collapse icon"
.my-app {
  --infinite-icon-expand-collapse: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M9 6l6 6-6 6'/%3E%3C/svg%3E");
}
```

The image is used as a mask, so only its shape matters (its colors don't) - the icon is painted with the current text color (the expand/collapse icon uses `--infinite-expand-collapse-icon-color` and the loading icon uses the accent color).

The available icon variables are:

| CSS variable | Icon |
| --- | --- |
| `--infinite-icon-expand-collapse` | expand/collapse icon of group rows, tree nodes and row details - should point to the end (right), it's rotated when expanded |
| `--infinite-icon-loading` | loading icon - it's rotated by a CSS animation |
| `--infinite-icon-sort-asc` | sort ascending icon, in column headers |
| `--infinite-icon-sort-desc` | sort descending icon, in column headers |
| `--infinite-icon-filter` | the icon displayed in the header of filtered columns |
| `--infinite-icon-menu` | the column menu icon, in column headers |
| `--infinite-icon-done` | the icon for the selected filter operator, in the filter operator menu |
| `--infinite-icon-clear` | the icon for clearing the filter, and for removing a group in the grouping toolbar |
| `--infinite-icon-hidden` | the icon displayed when dragging a column outside the table, to hide it |
| `--infinite-icon-filter-operator-contains`, `-starts-with`, `-ends-with`, `-eq`, `-neq`, `-gt`, `-gte`, `-lt`, `-lte` | the filter operator icons |

When the variables are not specified, the default icons are rendered (as inline SVG). The variables work the same way in React and Vue.

```tsx file="custom-icons-example.demo.tsx" title="Replacing the icons via CSS variables"
```

<Note>

You can also replace the icons with your own components - see <PropLink name="columns.renderSortIcon" />, <PropLink name="columns.renderMenuIcon" />, <PropLink name="columns.renderGroupIcon" /> and <PropLink name="columns.renderTreeIcon" />.

</Note>

## Available themes

### Default theme

The `default` theme is applied when you don't specify any explicit theme by default.

### Minimalist theme

The `minimalist` theme is inspired from minimalistic designs and is a good choice if you want to keep the UI simple and clean.

### Terminal theme

The `terminal` theme is made for dense, data-heavy screens, like trading desks: a monospace font with tabular numbers (so numbers line up), compact rows, hairline dividers and green/red flashing for values going up/down. It's designed dark-first, but it has a light mode too.

```ts file="index.snippet.tsx" region="terminal-theme"
```

```tsx file="index.snippet.tsx" region="terminal-theme-class-names"
```

It works with the density classNames - since the theme is already dense, `infinite-density--compact` makes it even denser.

```tsx file="terminal-theme-example.demo.tsx" title="Terminal theme, with flashing cells"
```

### Sheet theme

The `sheet` theme looks like a spreadsheet: full gridlines, sharp corners, an active cell with a thick border and a fill handle, and a header that looks like the column headers of a spreadsheet. It has a light and a dark mode.

```ts file="index.snippet.tsx" region="sheet-theme"
```

The first column pinned at the start (see <PropLink name="columnPinning" />) is styled like the row headers of a spreadsheet - so if you want row numbers, add a column that renders `rowInfo.indexInAll + 1` and pin it at the start.

```tsx file="sheet-theme-example.demo.tsx" title="Sheet theme, with a row number column"
```

### Paper theme

The `paper` theme is borderless and airy: hairline row separators, a subtle hover, selected rows painted as rounded pills, and its own icon set (rounded strokes) - a good fit for document-like and productivity apps. It has a light and a dark mode.

```ts file="index.snippet.tsx" region="paper-theme"
```

Its icons are set via the `--infinite-icon-*` CSS variables (see [Icons](#icons)), so you can replace any of them, or reuse them with another theme.

```tsx file="paper-theme-example.demo.tsx" title="Paper theme, with selected rows"
```
