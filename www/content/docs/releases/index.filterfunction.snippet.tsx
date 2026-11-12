// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { DataSource } from '@infinite-table/infinite-react';

type Person = {
  id: number;
  name: string;
  age: number;
};

declare const data: Person[];

//#region filter-function
import { defaultFilterFunction } from '@infinite-table/infinite-react';

// before
<DataSource<Person>
  primaryKey="id"
  data={data}
  filterFunction={({ data }) => data.age > 30}
/>;

// now, to also apply the column filters
<DataSource<Person>
  primaryKey="id"
  data={data}
  filterFunction={(param) => defaultFilterFunction(param) && param.data.age > 30}
/>
//#endregion
