---
title: Many Rows and Columns
---

This example showcases a DataGrid with **10.000 rows** and **12 columns**.

<Note>

Adding more columns will not affect performance, as the DataGrid uses virtualization for both rows and **columns**.
</Note>



<Sandpack  size="lg">

```tsx file="many-rows-and-columns-example.page.tsx"

```
</Sandpack>


<Note>

Infinite Table guarantees you that the user will NEVER see white space when scrolling horizontally or vertically.
</Note>