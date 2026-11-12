// Snippets shown on column-rendering.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

//#region use-column-components-to-customize-the-column
import { InfiniteTableColumn } from '@infinite-table/infintie-react';

const ColumnCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, rowInfo } = useInfiniteColumnCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};

const HeaderCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, sortTool } = useInfiniteHeaderCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {sortTool}
      First name
    </div>
  );
};

const nameColumn: InfiniteTableColumn<Developer> = {
  header: 'Name',
  field: 'firstName',
  components: {
    ColumnCell,
    HeaderCell,
  },
};
//#endregion
