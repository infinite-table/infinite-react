// Snippet shown on column-rendering.page.md (in its own file, as it has an import).
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
};

//#region use-column-components-to-customize-the-column
import { InfiniteTableColumn } from '@infinite-table/infinite-react';

const ColumnCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, rowInfo } = useInfiniteColumnCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};

const HeaderCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, renderBag } = useInfiniteHeaderCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {renderBag.sortIcon}
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

export { nameColumn };
