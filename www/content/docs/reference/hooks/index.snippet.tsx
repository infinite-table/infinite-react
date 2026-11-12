// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

//#region usedatasourcestate
import { useDataSourceState } from '@infinite-table/infinite-react'
//#endregion

{
  //#region example-usage-selecting-the-length-of-the-data

  const length = useDataSourceState(state => state.dataArray.length)
  //#endregion
}

{
  //#region infinitetable-can-be-nested-anywhere-inside-the
  <DataSource>
    <h1>Your DataGrid>
    <App>
      <InfiniteTable />
    </App>
  </DataSource>
  //#endregion
}

//#region useinfinitecolumncell
import { useInfiniteColumnCell } from '@infinite-table/infinite-react';
//#endregion

{
  //#region useinfinitecolumncell-2
  const CustomCellComponent = (props: React.HTMLProps<HTMLDivElement>) => {
    const { domRef, ...other } = useInfiniteColumnCell<Developer>();

    return (
      <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
        {props.children}
      </div>
    );
  };
  //#endregion
}

//#region useinfiniteheadercell
import { useInfiniteHeaderCell } from '@infinite-table/infinite-react';
//#endregion

{
  //#region useinfiniteheadercell-2
  const CustomHeaderComponent = (props: React.HTMLProps<HTMLDivElement>) => {
    const { domRef, ...other } = useInfiniteHeaderCell<Developer>();

    return (
      <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
        {props.children}
      </div>
    );
  };
  //#endregion
}

export {};
