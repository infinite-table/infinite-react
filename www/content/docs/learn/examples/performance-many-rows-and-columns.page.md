---
title: Performance with Many Rows and Columns
---

This example showcases a DataGrid with **10.000 rows** and **12 columns**.

<HeroCards>
<YouWillLearnCard title="Working with Data" path="/docs/learn/working-with-data">
Find out more about how to work with data - both client-side and server-side.
</YouWillLearnCard>

<YouWillLearnCard title="Working with Columns" path="/docs/learn/working-with-columns">
See our page on using and configuring columns. It shows you how to use and customize columns to your needs.
</YouWillLearnCard>
</HeroCards>

<Sandpack  size="lg" viewMode="preview">

<Description>

DataGrid with 10k rows and 12 columns.

Adding more columns will not affect performance, as the DataGrid uses virtualization for both rows and **columns**.

</Description>

```tsx file="many-rows-and-columns-example.page.tsx"

```

</Sandpack>

<Note>

Infinite Table guarantees you that the user will NEVER see white space when scrolling horizontally or vertically.
</Note>
