// Snippets shown on infinite-table-monthly-update-august-2022.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

// `T` on the page is the type of the data items
export function columnRenderingPipeline<T>() {
  //#region column-rendering-pipeline
  const column: InfiniteTableColumn<T> = {
    valueGetter: () => 'world',
    renderValue: ({ value, renderBag, rowInfo }) => { // #highlight
      // at this stage, `value` is 'world' and `renderBag.value` has the same value, 'world'
      return <b>{value}</b>;
    },

    render: ({ value, renderBag, rowInfo }) => {
      // at this stage `value` is 'world'
      // but `renderBag.value` is <b>world</b>, as this was the value returned by `renderValue`
      return <div>Hello {renderBag.value}!</div>;
    }, // #highlight
  };
  //#endregion
  return column;
}

export function sortableGroupColumns() {
  //#region sortable-group-columns
  const sortInfo = [{ field: ['stack', 'age'], dir: 1, id: 'group-by' }];
  //#endregion
  return sortInfo;
}
