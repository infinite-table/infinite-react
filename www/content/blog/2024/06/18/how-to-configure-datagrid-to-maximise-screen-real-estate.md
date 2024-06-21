---
title: How to configure the DataGrid to maximise screen real estate
author: admin
---

Many modern apps rely heavily on white-space to make the user interface easy to read and follow. However, there are financial apps or data-heavy apps where you need to display a lot of information in a small space.
In this blogpost, we want to show you how to tweak the theming of the Infinite React DataGrid to make it more dense and maximise screen real estate.

## Configuring the spacing in the DataGrid cells

The CSS variable you want to target is `--infinite-cell-padding` - it's used to set the padding of the cells in the DataGrid. By default, the padding is set to `var(--infinite-space-2) var(--infinite-space-3)`. This means that the padding is set to `4px 8px` for a root font size of `16px`.

```css {2} title="Default definition for --infinite-cell-padding"
:root {
  --infinite-cell-padding: var(--infinite-space-2) var(--infinite-space-3); /* vertical horizontal */

  --infinite-space-2: .25rem; /* 4px - for a root font size of 16px */
  --infinite-space-3: .5rem; /* 8px */
}
```

You can override this variable in your CSS to make the padding smaller. For example, you can set the padding to `2px 4px` by setting the variable like this:

```css {2} title="Override the --infinite-cell-padding variable"
body {
  --infinite-cell-padding: 2px 4px;
}
```

<Note>

It's important to understand that cell height is not given by the padding, but by the <PropLink name="rowHeight" /> prop.

So if you want to make the DataGrid more dense, you should also consider setting the <PropLink name="rowHeight" /> prop to a smaller value.

</Note>

<CSEmbed id="react-datagrid-infinite-table-theme-switching-forked-psnzfr" title="Using rowHeight and cell padding to configure a dense mode in DataGrid cells" code={false} />

## Configuring the spacing in the column headers

For configuring padding inside column headers, you need to use the ```--infinite-header-cell-padding``` CSS var.

```css {2} title="Default definition for --infinite-header-cell-padding"
:root {
  --infinite-header-cell-padding: var(--infinite-header-cell-padding-y) var(--infinite-header-cell-padding-x);
  --infinite-header-cell-padding-x: var(--infinite-space-3);
  --infinite-header-cell-padding-y: var(--infinite-space-3);
}
```

You can make the padding smaller for example give it a value of `2px 4px` by setting the variable like this:

```css {2} title="Override the --infinite-header-cell-padding variable"
body {
  --infinite-header-cell-padding: 2px 4px;
}
```

<CSEmbed id="react-datagrid-dense-mode-forked-tz3gft" title="Dense mode in both cells and column headers" code={false}/> 

The above demo also uses the <PropLink name="headerOptions.alwaysReserveSpaceForSortIcon" /> prop to make sure that the column headers don't reserve a space for the sort icon when the respective column is not sorted.

<Note>

Another option would be to override the CSS spacing scale that InfiniteTable defines - but that affects more than just the padding of the cells and headers.

```CSS title="Default values for the spacing scale"
:root {
  --infinite-space-1: .125rem;
  --infinite-space-2: .25rem;
  --infinite-space-3: .5rem;
  --infinite-space-4: 0.75rem;
  --infinite-space-5: 1rem;
}
```

You're encouraged to experiment with these variables to find the right balance for your app.

</Note>