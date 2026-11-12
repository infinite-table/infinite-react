// Snippets shown on how-to-configure-default-sorting.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';

{
  //#region specifying-a-default-sort-order
  // sort by country DESC and salary ASC
  const defaultSortInfo={[
    { field: "country", dir: -1 },
    { field: "salary", dir: 1 },
  ]}

  <DataSource defaultSortInfo={defaultSortInfo} />
  //#endregion
}

{
  //#region local-vs-remote-sorting
  const dataSource: DataSourceData<Developer> = ({ sortInfo }) => {
    if (sortInfo && !Array.isArray(sortInfo)) {
      sortInfo = [sortInfo];
    }
    const args = [
      sortInfo
        ? 'sortInfo=' +
          JSON.stringify(
            sortInfo.map((s) => ({
              field: s.field,
              dir: s.dir,
            })),
          )
        : null,
    ]
      .filter(Boolean)
      .join('&');

    return fetch('https://your-backend.com/fetch-data?' + args)
      .then((r) => r.json())
      .then((data: Developer[]) => data);
  };
  //#endregion
}

export {};
