---
title: The First DataGrid with a DevTools Extension
description: We've launched a Chrome DevTools Extension for Infinite Table
author: admin
date: 2025-05-12
---

We're happy to announce that [Infinite Table DevTools extension](https://chromewebstore.google.com/detail/infinite-table-devtools-e/jpipjljbfffijmgiecljadbogfegejfa) is now live!

Infinite Table is the first DataGrid with a Chrome DevTools extension. Starting with version `7.0.0` of Infinite, you can specify the `debugId` property on the `<InfiniteTable />` instance and it will be picked up by the devtools.

<Note>

To see the extension on a live demo, head to the [chrome webstore](https://chromewebstore.google.com/detail/infinite-table-devtools-e/jpipjljbfffijmgiecljadbogfegejfa) to download the extension.

Then visit [our live demo page](/full-demo) and open your browser devtools - you should see the "Infinite Table" devtool tab. Click it and enjoy interacting with the DataGrid!
</Note>


```tsx {16}
const columns = {
  name: {
    field: 'firstName',
  },
  lastName: {
    field: 'lastName',
  },
  age: {
    field: 'age',
  },
}

const App = () => {
  return <DataSource primaryKey={'id'} data={[...]}>
    <InfiniteTable
      debugId="simple"
      columns={columns}
    />
  </DataSource>
}
```

<Note>

If you have multiple instances, each with a unique `debugId` property, they will all show up
</Note>

<img src="https://raw.githubusercontent.com/infinite-table/infinite-react/refs/heads/master/devtools/screenshots/main.jpg" alt="Infinite Table DevTools Extension" width="100%" style={{minWidth: "100%"}} />


## Current features

The Devtools extension was launched with an initial feature-set, which will expand as we grow and as we get user feedbak - so be sure to tell us what you'd like to see in the devtools.

Currently, it offers the ability to do the following:
 - see the list of all columns and adjust which are visible
 - see timings of the following data operations: sorting, filtering, group/pivot/tree.
    This always show how much the last operation of that type took.
 - interact with the grouping and sorting information in the `<DataSource />` - and revert it to user-values at any time
 - see and clear the logs
 - see various warning messages and performance-related issues.

## Planned features

As we already mentioned, we're planning to expand the devtools, as we're just getting a taste of what's possible. It took us some time to figure our our best workflow in developing the devtools, and we're now confident we can iterate much faster.

Having said this, we're looking for feedback from you on what insights you'd like to see in the InfiniteTable DataGrid via the devtools. We have our own list of things we want to work on, but we plan to incorporate user-feedback asap. So here's our wishlist for the devtools:

 - ability to see more timings on various operations - including a chart with historical values during the lifetime of a DataGrid instance - something similar to how React DevTools shows render operations and their durations.
 - add the ability to filter logs via channel
 - show more performance tips&tricks that can make your DataGrid faster
 - allow you to interact with many props of the DataGrid - row and cell selection, keyboard navigation, filters, column state, sorting, pivoting, pivot result columns, aggregations, column groups, lazy loading, theming and more.
 - give you a full state of the DataGrid, and the ability to apply and restore it at any time.
 - show you the details of your license key and remind you if it's close to the expiration date.


## Your turn

It's your turn to give us feedback on the Infinite Table DevTools Extension!

Let us know what you think and how you'd like to use it in order to enhance your interaction with the DataGrid. 