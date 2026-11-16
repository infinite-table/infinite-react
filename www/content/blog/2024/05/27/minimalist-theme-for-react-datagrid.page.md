---
title: A minimalist theme for your favorite React DataGrid
author: admin
date: 2024-05-27
tags: theming
---

We implemented a minimalist theme for the Infinite React DataGrid - it's designed to be simple and clean, with a focus on readability and performance.

Building a second theme forced us think about dark/light mode support and how to make the theme more customizable.

<CSEmbed id="react-datagrid-infinite-table-theme-switching-666xq7" code={false} />

<Note>

Read more about the [available themes in our React DataGrid](/docs/learn/theming#available-themes).

</Note>


## Available themes

### Default theme

The `default` theme is applied when you don't specify any explicit theme by default.

### Minimalist theme

The `minimalist` theme is inspired from minimalistic designs and is a good choice if you want to keep the UI simple and clean.

## Applying the theme

A theme is applied by using the `"infinite-theme-name--THEME_NAME"` CSS className in any parent element of the `<InfiniteTable />` component (or even on the component element).

You will want to apply the theme name and theme mode classNames to the same element, so you'll end up with a className like `"infinite-theme-name--minimalist infinite-theme-mode--dark"`.

```tsx file="minimalist-theme-for-react-datagrid.snippet.tsx" region="applying-the-minimalist-theme-with-dark-mode" title="Applying the minimalist theme with dark mode explicitly"
```



## Using theme mode

There are two theme modes available in Infinite: `light` and `dark`. Unless otherwise explicitly configured, the theme mode is applied based on the user OS settings for the [preferred color scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).

However, the theme mode can be enforced, by having a parent element with a CSS className of `"infinite-theme-mode--light"` or `"infinite-theme-mode--dark"`

```tsx file="minimalist-theme-for-react-datagrid.snippet.tsx" region="applying-light-mode-via-container-classname" title="Applying light mode via container className"
```

```tsx file="minimalist-theme-for-react-datagrid.snippet.tsx" region="explicitly-applying-dark-theme-via-container" title="Explicitly applying dark theme via container className"
```