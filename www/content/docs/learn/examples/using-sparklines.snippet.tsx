// Snippets shown on using-sparklines.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

type Employee = {
  id: number;
  firstName: string;
  department: string;
  bugFixes: number[];
};

export function getColumns() {
  //#region using-column-rendervalue-to-render-a-sparkline
  const columns: InfiniteTablePropColumns<Employee> = {
    // ... other columns
    id: {
      field: 'id',
      defaultWidth: 100,
    },
    bugFixes: {
      field: 'bugFixes',
      header: 'Bug Fixes',
      defaultWidth: 300,
      // #highlight
      renderValue: ({ value, data }) => {
        const color =
          data?.department === 'IT' || data?.department === 'Management'
            ? 'tomato'
            : '#253e56';
        return (
          <Sparklines
            data={value}
            style={{
              width: '100%',
            }}
            height={30}
          >
            <SparklinesLine color={color} />
          </Sparklines>
        );
      // #endhighlight
      },
    },
  }
  //#endregion
  return columns;
}
