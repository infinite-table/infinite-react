---
title: Debugging your DataGrid performance with custom tracks in Chrome DevTools
description: Infinite Table will now add custom tracks to Chrome DevTools performance profiler to help you debug the performance of your DataGrid
date: 2025-10-20
author: radu
tags: devtools, perf
thumbnail: debugging-your-datagrid-performance-with-custom-tracks-in-chrome-devtools-performance-profiler.png
---

> We want to make sure Infinite Table is the top React DataGrid in terms of performance. And we also want to give you the right tools to track down any slowness you might find in your app.

Infinite Table was the [first DataGrid with a DevTools extension](/blog/2025/05/12/the-first-devtools-for-a-datagrid).

Today we announce Infinite Table is the first DataGrid that gives you custom tracks in Chrome DevTools performance profiles.

We've been inspired by the [React 19.2 release blogpost](https://react.dev/blog/2025/10/01/react-19-2#performance-tracks) where the React team announced the custom tracks being available in the performance profiler.

So we thought, why not!

<Note>

To see your Infinite DataGrid instance in the Chrome DevTools profiler, make sure you specify the <PropLink name="debugId" /> prop.

Basically, if you have multiple grids in your app, you'll be able to see a dedicated track for each separate instance.

</Note>


```tsx {3} title="Specify the debugId prop to see the DataGrid in the Chrome Profiler"
<DataSource>
  <InfiniteTable
    debugId="your-datagrid"
  />
</DataSource>
```

Once your <PropLink name="debugId" /> prop is configured, you can hit the recording the performance profile in Chrome DevTools, and once the profile is done, you'll see something similar to the image below.

![Infinite Table DataGrid custom tracks in Chrome DevTools Performance Profiler](/blog-images/infinite-custom-tracks-in-devtools-profiler.png)

For now, we mainly show data-heavy operations, like sorting, grouping/filtering and flattening the data array, but more will be added in the near future.

The custom tracks give you high-fidelity information about the time the operation took, but give you additional insights - like the count of your data-array for sorting operations, what types of manipulations actually take place with the data and more.

We're really interested to see what other insights you find useful and want us to include in the custom tracks. Reach out to us on [X](https://x.com/get_infinite) and let's start the conversation!
