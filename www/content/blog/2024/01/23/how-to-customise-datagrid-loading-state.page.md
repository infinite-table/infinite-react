---
title: How to customise the DataGrid loading state
author: admin
date: 2024-01-23
tags: customizing, theming
---

We're starting a series of short `"How to"` articles that are very focused and show how to achieve a specific thing with the Infinite Table DataGrid.

In this article, we'll document how to customise the DataGrid loading state.

## Customising the loading text

First off, you can customise the text that is displayed when the DataGrid is loading data. By default, the DataGrid displays a `"Loading"` text, but you can customise it to anything you want (even JSX, not only string values).

```tsx file="how-to-customise-datagrid-loading-state.snippet.tsx" region="customising-the-loading-text" title="Customising the loading text"
```

<Note>
For the value of <PropLink name="loadingText" /> you can use JSX, not only strings.
</Note>

<CSEmbed id="infinite-table-datagrid-custom-loading-text-yzqlsj" />

## Customising the loading component - the `LoadMask`

In addition to the loading text, you can also customise the `LoadMask` component. This is the component that is displayed when the DataGrid is loading data. By default, it's a `<div />` with `width: 100%; height: 100%; zIndex: 1; display: flex` that contains the loading text.

You do this by overriding the <PropLink name="components.LoadMask" /> prop in your Infinite Table configuration.

```tsx file="how-to-customise-datagrid-loading-state.snippet.tsx" region="customising-the-loadmask-component" title="Customising the LoadMask component"
```

<CSEmbed id="infinite-table-datagrid-custom-loading-text-forked-vpqps3" />
