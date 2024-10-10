---
title: Flashing column cells in Infinite Table
author: admin
draft: true
---

Flashing cells is an important feature that has been requested by some of our users - both [in public](https://github.com/infinite-table/infinite-react/issues/250) and private conversations.

It's also a very useful addition for DataGrids users that work in the financial industry. Version `5.0.0` of `<InfiniteTable />` shipped flashing and in this blogpost we want to show how to use it.

## Configuring a flashing column.

In order to configure a column to flash its cells when the data changes, you need to specify a custom `ColumnCell` component.

```tsx

import { FlashingColumnCell } from '@infinite-table/infinite-react';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  monthlyBonus: {
    field: 'monthlyBonus',
    components: {
      ColumnCell: FlashingColumnCell,
    }
  },
};
```

`@infinite-table/infinite-react` exports a `FlashingColumnCell` React component that you can pass to the `components.ColumnCell` prop of any column you want to flash.


