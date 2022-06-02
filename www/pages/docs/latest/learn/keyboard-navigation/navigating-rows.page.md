---
title: Keyboard Navigation for Rows
---

Infinite Table supports keyboard navigation for both rows and cells. This page documents using if for quickly navigating rows in the table.


The easiest way to enable keyboard navigation is to specify <PropLink name="defaultActiveRowIndex">defaultActiveRowIndex=0</PropLink>. This tells the table that there should be a default active row, namely, the row at index 0.

<Sandpack>

<Description>

Click on the table and use the arrow keys to navigate the rows.

</Description>

```ts file=navigating-rows-uncontrolled-example.page.tsx
```
</Sandpack>

<Note>

* Use `ArrowUp` and `ArrowDown` to navigate the rows one by one.
* Use `PageUp` and `PageDown` to navigate the rows by pages (a page is considered equal to the visible row count).
* Use `Home` and `End` to navigate to the first and last rows.

</Note>
