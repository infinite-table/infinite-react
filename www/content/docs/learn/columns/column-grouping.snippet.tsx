// Snippets shown on column-grouping.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTableColumn,
  InfiniteTableColumnGroup,
} from '@infinite-table/infinite-react';

import type { Person } from './column-groups-data';

export function defineColumnGroups() {
  //#region defining-column-groups
  const columnGroups: Record<string, InfiniteTableColumnGroup> = {
    'contact info': { header: 'Contact info' },
    // `street` column group belongs to the `address` columnGroup
    street: { header: 'street', columnGroup: 'address' },
    location: { header: 'location', columnGroup: 'address' },

    // this is a top-level group
    address: { header: 'Address' }
  }
  //#endregion
  return columnGroups;
}

export function defineColumnsWithGroups() {
  //#region defining-columns-with-groups
  const columns: Record<string, InfiniteTableColumn<Person>> = {
    id: { field: 'id' },

    // `streetNo` column belongs to the `street` columnGroup
    streetNo: { field: 'streetNo', columnGroup: 'street' },
    city: { field: 'city', columnGroup: 'location' },

    streetName: { field: 'streetName', columnGroup: 'street' },
    firstName: { field: 'firstName' },

    country: { field: 'country', columnGroup: 'location' },
    region: { field: 'region', columnGroup: 'location' },

    email: { field: 'email', columnGroup: 'contact info' },
    phone: { field: 'phone', columnGroup: 'contact info' },
  };
  //#endregion
  return columns;
}
