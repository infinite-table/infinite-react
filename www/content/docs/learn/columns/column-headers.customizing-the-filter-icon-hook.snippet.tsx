// Snippet shown on column-headers.page.md (in its own file, as it has an import).
// Type-checked against the library source (`npm run tsc:content`).
import type { InfiniteTableColumn } from '@infinite-table/infinite-react';

type Person = {
  id: string;
  firstName: string;
};

//#region customizing-the-filter-icon-hook
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

function renderMenuIcon(){
  const { filtered } = useInfiniteHeaderCell(); // #highlight
  return filtered ? '🔥' : '';
}
//#endregion

// the function above is what `column.renderMenuIcon` is set to
export const filterIconHookColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderMenuIcon,
};
