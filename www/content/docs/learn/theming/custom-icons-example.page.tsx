import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, Employee } from './columns';

// any image can be used as an icon - it's used as a mask, painted with the
// text color (or the icon color, for the expand/collapse icon)
const svgIcon = (paths: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`,
  )}")`;

const iconVars = {
  '--infinite-icon-expand-collapse': svgIcon('<path d="M9 6l6 6-6 6"/>'),
  '--infinite-icon-sort-asc': svgIcon('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  '--infinite-icon-sort-desc': svgIcon('<path d="M12 5v14M19 12l-7 7-7-7"/>'),
  '--infinite-icon-menu': svgIcon(
    '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  ),
} as React.CSSProperties;

export default function App() {
  return (
    <DataSource<Employee>
      data={dataSource}
      primaryKey="id"
      groupBy={[{ field: 'department' }]}
      defaultSortInfo={[{ field: 'salary', dir: -1 }]}
    >
      <InfiniteTable<Employee>
        debugId="custom-icons-example"
        domProps={{ style: iconVars }}
        columns={columns}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100').then((r) =>
    r.json(),
  );
};
