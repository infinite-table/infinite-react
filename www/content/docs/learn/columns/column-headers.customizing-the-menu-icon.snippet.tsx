// Snippet shown on column-headers.page.md (in its own file, as it has an import).
// Type-checked against the library source (`npm run tsc:content`).
import type { InfiniteTableColumn } from '@infinite-table/infinite-react';

type Person = {
  id: string;
  firstName: string;
};

//#region customizing-the-menu-icon
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

function renderMenuIcon(){
  const { column } = useInfiniteHeaderCell(); // #highlight
  return `🔧 ${column.id}`;
}
//#endregion

// the function above is what `column.renderMenuIcon` is set to
export const menuIconHookColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderMenuIcon,
};
