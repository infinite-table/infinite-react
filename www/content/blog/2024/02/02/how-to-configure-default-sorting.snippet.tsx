// Snippets shown on how-to-configure-default-sorting.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import type {
  DataSourceData,
  DataSourceProps,
  DataSourcePropSortInfo,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  salary: number;
};

// The post shows only the prop it is about, so this stands in for the real
// `DataSource`: the same props, none of them required (`data` and `primaryKey`
// are left out of the shown code).
declare function DataSource(props: Partial<DataSourceProps<Developer>>): React.JSX.Element;

export function DefaultSortOrder() {
  //#region specifying-a-default-sort-order
  // sort by country DESC and salary ASC
  const defaultSortInfo: DataSourcePropSortInfo<Developer> = [
    { field: "country", dir: -1 },
    { field: "salary", dir: 1 },
  ];

  <DataSource defaultSortInfo={defaultSortInfo} />
  //#endregion
  return null;
}

export function remoteSorting() {
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
  return dataSource;
}
