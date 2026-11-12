// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import { useState } from 'react';
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
  //#region issue-performance-degradation-because-props-are
  <DataSource
    // dont do this
    groupBy={[{ field: 'country' }]}
  />
  //#endregion
}

{
  //#region issue-performance-degradation-because-props-are-2
  const [groupBy, setGroupBy] = useState([{ field: 'country' }]);

  <DataSource groupBy={groupBy} onGroupByChange={setGroupBy} />;
  //#endregion
}

export {};
