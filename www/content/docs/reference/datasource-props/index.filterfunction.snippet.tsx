// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  name: string;
  age: number;
};

declare const data: Developer[];

//#region filterfunction
import { defaultFilterFunction } from '@infinite-table/infinite-react';

// the built-in column filtering
<DataSource<Developer> primaryKey="id" data={data} filterFunction={defaultFilterFunction} />;

// your own logic only
<DataSource<Developer> primaryKey="id" data={data} filterFunction={(param) => param.data.age > 30} />;

// the column filters, and your own condition
<DataSource<Developer>
  primaryKey="id"
  data={data}
  filterFunction={(param) => defaultFilterFunction(param) && param.data.age > 30}
/>;
//#endregion
