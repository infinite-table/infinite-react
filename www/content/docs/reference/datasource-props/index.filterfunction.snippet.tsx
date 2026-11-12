// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region filterfunction
import { defaultFilterFunction } from '@infinite-table/infinite-react';

// the built-in column filtering
filterFunction={defaultFilterFunction}

// your own logic only
filterFunction={(param) => param.data.age > 30}

// the column filters, and your own condition
filterFunction={(param) => defaultFilterFunction(param) && param.data.age > 30}
//#endregion
