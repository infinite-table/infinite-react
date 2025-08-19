---
title: Flashing column cells in Infinite Table
author: admin

---

Flashing cells is an important feature that has been requested by some of our users - both [in public](https://github.com/infinite-table/infinite-react/issues/250) and private conversations.

It's also a very useful addition for DataGrids users that work in the financial industry. Version `5.0.0` of `<InfiniteTable />` shipped flashing and in this blogpost we want to show how to use it.

## Configuring a flashing column.

In order to configure a column to flash its cells when the data changes, you need to specify a custom `ColumnCell` component.

```tsx {14}

import { FlashingColumnCell } from '@infinite-table/infinite-react';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  salary: {
    field: 'salary',
    components: {
      ColumnCell: FlashingColumnCell,
    }
  },
};
```

`@infinite-table/infinite-react` exports a `FlashingColumnCell` React component that you can pass to the `components.ColumnCell` prop of any column you want to flash.


<CSEmbed id="infinite-flashing-lnf83g" code={false} />

<Note>

The default flashing duration is `1000` milliseconds.

</Note>

## Customizing the flashing duration

If you want to customize the flashing duration, you need to pass a different `components.ColumnCell` to the column. You can very easily do this by calling `createFlashingColumnCellComponent` and passing the `flashDuration` option.

```tsx

import { createFlashingColumnCellComponent } from '@infinite-table/infinite-react';

const FlashingColumnCell = createFlashingColumnCellComponent({
  flashDuration: 500,
  flashClassName: 'my-flash-class',
});

const columns: InfiniteTablePropColumns<Developer> = {
  salary: {
    field: 'salary',
    components: {
      ColumnCell: FlashingColumnCell,
    }
  }
}
```

<Note>

When calling `createFlashingColumnCellComponent`, besides the `flashDuration` option, you can also pass a `flashClassName`, which is a CSS class name that will be applied to the flashing cell for the duration of the flash.

</Note>

## Customizing the flash colors

If you want to customize the flash colors, you have three CSS variables available: 

- `--infinite-flashing-background`: background color to be used when non-numeric cells flash.
- `--infinite-flashing-up-background`: background color to use for flashing numeric cells, when the value goes up.
- `--infinite-flashing-down-background`: background color to use for flashing numeric cells, when the value goes down.

The example below is configured to use the following colors:
 - flash up - yellow
 - flash down - magenta
 - flash non-numeric - blue

Also, the flashing duration is configured to take 2 seconds.

<Note>

Besides clicking the "start updates" button, you can also edit the salary value in any cell. When you confirm the edit, the salary value will flash.

</Note>

<CSEmbed title="Flashing takes 2s and has custom colors" id="infinite-flashing-forked-fpjrsg?workspaceId=cf52b898-10a5-4d0b-833f-96a3a9220dc5" code={false} />

## Taking it further

Infinite Table implements flashing by passing in a custom `ColumnCell` component. However, you're not limited to using our [default implementation](https://github.com/infinite-table/infinite-react/blob/master/source/src/components/InfiniteTable/components/InfiniteTableRow/FlashingColumnCell.tsx). You can very easily create your own component and apply your own custom logic.

Maybe you want display both the new and the old values in the cell - this can be implemented quite easily. It's up to you to extend the cell rendering to suit your business requirements.

The current flashing implementation is flashing on any change in a cell, but you might be interested only in some of the changes. You can definitely use <PropLink name="onEditPersistSuccess" /> to detect when a cell edit is persisted and then decide whether to flash the cell or not. The possibilities are very diverse.

We're keen to see what you build!



