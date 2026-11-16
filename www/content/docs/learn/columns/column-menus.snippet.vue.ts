// Snippets shown on the Vue version of column-menus.page.md: the sibling of
// column-menus.snippet.tsx, for the regions that are not the same code in Vue.
// Type-checked with vue-tsc against the library source (`npm run tsc:vue`).
import { h } from 'vue';
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

export function customMenuIcon() {
  //#region custom-menu-icon
  const columns = {
    name: {
      field: 'firstName',
      renderMenuIcon: () => h('div', '🌎'),
    },
    salary: {
      field: 'salary',
      renderMenuIcon: false,
    },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the column type here
  // (without `field`, which is just a `string` in an object that has no annotation)
  const checked: Record<string, Omit<InfiniteTableColumn<Developer>, 'field'>> = columns;
  return checked;
}
