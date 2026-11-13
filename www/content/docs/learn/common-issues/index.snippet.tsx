// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import { useState } from 'react';
import {
  DataSource,
  type DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
};

declare const data: Developer[];

export function NewPropsOnEveryRender() {
  return (
    //#region issue-performance-degradation-because-props-are
    <DataSource
      primaryKey="id"
      data={data}
      // dont do this
      groupBy={[{ field: 'country' }]}
    />
    //#endregion
  );
}

export function StablePropsInState() {
  //#region issue-performance-degradation-stable-props
  const [groupBy, setGroupBy] = useState<DataSourcePropGroupBy<Developer>>([{ field: 'country' }]);

  <DataSource primaryKey="id" data={data} groupBy={groupBy} onGroupByChange={setGroupBy} />;
  //#endregion
  return null;
}
