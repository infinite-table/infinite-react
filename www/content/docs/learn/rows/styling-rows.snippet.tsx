// Snippets shown on styling-rows.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
} from '@infinite-table/infinite-react';

type Employee = {
  id: number;
  name: string;
  salary: number;
};

{
  //#region defining-a-rowstyle-function
  const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
    data,
    rowInfo,
  }: {
    data: Partial<Employee> | null;
    rowInfo: InfiniteTableRowInfo<Employee>;
  }) => {
    const salary = data?.salary ?? 0;

    if (salary > 150_000) {
      return { background: 'tomato' };
    }
    if (rowInfo.indexInAll % 10 === 0) {
      return { background: 'lightblue', color: 'black' };
    }
    return undefined;
  };
  //#endregion
}

export {};
