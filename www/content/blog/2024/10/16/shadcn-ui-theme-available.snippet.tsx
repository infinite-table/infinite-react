// Snippets shown on shadcn-ui-theme-available.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
  type DataSourceProps,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
};

// the snippet spreads these - the post is about the CSS import and the classNames
declare const dataSourceProps: DataSourceProps<Developer>;
declare const props: InfiniteTableProps<Developer>;

//#region intro
import '@infinite-table/infinite-react/index.css';

<div className="infinite-theme-name--shadcn dark">
  <DataSource  {...dataSourceProps}>
    <InfiniteTable {...props} />
  </DataSource>
</div>
//#endregion

export {};
