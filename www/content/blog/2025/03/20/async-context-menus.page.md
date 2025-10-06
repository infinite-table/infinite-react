---
title: Async Context Menus
description: Learn how to use async context menus in Infinite Table.
date: 2025-03-20
---

Infinite Table 6.1.0 introduces support for lazy loading context menus. This is useful when you need to load your context menu items conditionally, from the backend, based on the cell's value or other conditions.

## How it works

Starting with version `6.1.0`, the <PropLink name="getCellContextMenuItems" /> and <PropLink name="getContextMenuItems" /> props can now return a `Promise` that resolves to an array of `MenuItem` objects (or an object with `items` and `columns` properties, if you need to also configure the columns).

<CSEmbed title="Async Context Menus" id="nostalgic-borg-qg8q7r" code={false}>

<Description>
Right click any cell in the DataGrid - the context menu will be displayed with a delay of `400ms`.
</Description>

</CSEmbed>

<Note>

The <PropLink name="getCellContextMenuItems" /> is called with an object that gives you access to all the info regarding the current right-clicked cell - both the row information and the current column. You can use that to decide whether you want to return a menu immediately or to fetch some data from the server and display the context menu after the server response comes in.

</Note>