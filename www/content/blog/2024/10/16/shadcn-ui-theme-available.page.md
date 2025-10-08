---
title: shadcn/ui theme available for the InfiniteTable React DataGrid
author: admin
date: 2024-10-16
---

We've all come to know and love ❤️ [shadcn/ui](https://ui.shadcn.com/). It comes with a consistent look and feel for all the components in the UI kit, and it's built on top of Tailwind, so people feel at home using it. As React developers, we're thankful for all the hard work happening in the React ecosystem, and we're happy to see more and more UI libraries focusing on providing great developer experience.

After recently building [a few other themes](/blog/2024/10/10/new-themes-available), we knew we had to build a shadcn/ui theme for `<InfiniteTable />`.

So we built one! It's simply called `shadcn`. For it to work, you'll need to make sure the shadcn/ui CSS variables are available, as the `<InfiniteTable />` theme variables will rely on the values of those CSS variables. Other than that, simply import the `<InfiniteTable />` CSS file and you're good to go.

```tsx
import '@infinite-table/infinite-react/index.css';

<div className="infinite-theme-name--shadcn dark">
  <DataSource  {...}>
    <InfiniteTable {...} />
  </DataSource>
</div>
```

You'll have to include the `infinite-theme-name--shadcn` class name on a parent element of `<InfiniteTable />` (or even on the `<InfiniteTable />` component itself). Additionally, for dark mode, you'll have to use the `dark` class name (on the body element for example) to put the shadcn/ui CSS variables in dark mode, and then `<InfiniteTable />` will pick that up. This means that for this theme, using the `infinite-theme-mode--dark` class name is optional.


<CSEmbed id="lucid-water-fmj7zx" code={false} size="lg" />


Enjoy!