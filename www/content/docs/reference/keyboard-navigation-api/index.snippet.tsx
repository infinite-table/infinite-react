// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTable,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

{
  //#region configuring-the-keyboard-navigation-to-be-cell
  <InfiniteTable keyboardNavigation="cell" />

  // can be "cell" (default), "row" or false
  //#endregion
}

{
  //#region intro

  const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
    // do something with it
    api.keyboardNavigationApi.gotoCell({direction: 'top'}) // #highlight
  }

  <InfiniteTable<DATA_TYPE>
    columns={[...]}
    onReady={onReady}
  />
  //#endregion
}

export {};
