---
title: Using drag-and-drop to update row grouping via the Grouping Toolbar
description: We've enhanced the InfiniteTable DataGrid with a Grouping Toolbar, which allows you to drag and drop columns to group/ungroup
author: admin
---


With version `7.2.0`, we added another component to make your interaction with the DataGrid easier - namely the `GroupingToolbar`.

This toolbar allows users to interact with row grouping very easily, via drag and drop. Drag column headers on the GroupingToolbar component and off you go, grouping is updated. Additionally, you can drag items on the GroupingToolbar in order to change the order of the row grouping.

```tsx {3} title="Base structure for using the grouping toolbar"
<DataSource>
  <InfiniteTable>
    <InfiniteTable.GroupingToolbar />
    <InfiniteTable.Header />
    <InfiniteTable.Body />
  </InfiniteTable>
</DataSource>
```

Simply reference the component via `InfiniteTable.GroupingToolbar` and nest it under `<InfiniteTable />`.

<Note>

In the above and below examples, for simplicity, we're not showing the whole configuration of the `<DataSource />` and `<InfiniteTable />` components - for full code examples, see further below.

</Note>

The good part is that you can very easily add additional elements to your structure and have the grouping toolbar displayed on the side, vertically.

```tsx {8} title="Example structure for vertical grouping toolbar"
<DataSource>
  <InfiniteTable>
    <div className="flex flex-1 flex-row">
      <div className="flex-1 flex flex-col">
        <InfiniteTable.Header />
        <InfiniteTable.Body />
      </div>
      <InfiniteTable.GroupingToolbar orientation="vertical" />
    </div>
  </InfiniteTable>
</DataSource>
```

<CSEmbed id="wandering-leftpad-2zxwxr" code={false} title="Using the GroupingToolbar" />

<Note>

In the example above, try dragging the header of the `hobby` column onto the GroupingToolbar to add grouping by `hobby`.

</Note>


## Horizontal and vertical layout

As shown above, you can use the `GroupingToolbar` both horizontally and vertically. This is configured via the `orientation` prop - either `"horizontal"` (the default) or `"vertical"`.

Make sure you configure this to match your desired layout.

<CSEmbed id="still-bird-td2rgc" code={false} title="Vertical layout demo" />

## Customizing and Extending the GroupingToolbar

When building this, we were sure you will want to customize almost everything about the toolbar. So we prepared a simple way to do this, via the `components` prop of the `GroupingToolbar`.

The following components are available:
 - `Placeholder` - controls the placeholder that's visible when there are no row groups available.
 - `ToolbarItem` - used to replace the toolbar items - corresponding to the row groups.
 - `Host` - the component itself - useful to override when you want to add some other React elements before or after the toolbar items.

In the example below, we demo how you can display a custom placeholder for the GroupingToolbar.

<CSEmbed id="sad-rubin-6kx2v6" code={false} title="Using a custom placeholder in the GroupingToolbar" />

With all these ways to hook into the component, there are no limits to the styling and structure of your layout.

Give it a try and let us know (via github issues or [twitter](https://x.com/get_infinite)) if there's anything you'd like to see improved or have questions about!

## Summary

The new `GroupingToolbar` component brings an intuitive drag-and-drop interface to row grouping in `InfiniteTable`. Whether you prefer horizontal or vertical layouts, the toolbar provides a seamless way to manage grouping while maintaining the flexibility to customize its appearance and behavior.

We're excited to see how you'll use this new feature in your applications. Happy coding!

