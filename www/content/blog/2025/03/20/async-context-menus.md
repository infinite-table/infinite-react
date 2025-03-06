---
title: Async Context Menus
description: Learn how to use async context menus in Infinite Table.
draft: true
---

Infinite Table 6.1.0 introduces support for lazy loading context menus. This is useful when you need to load your context menu items conditionally, from the backend, based on the cell's value or other conditions.

## How it works

Starting with version `6.1.0`, the <PropLink name="getCellContextMenuItems" /> and <PropLink name="getContextMenuItems" /> props can now return a `Promise` that resolves to an array of `MenuItem` objects (or an object with `items` and `columns` properties, if you need to also configure the columns).
