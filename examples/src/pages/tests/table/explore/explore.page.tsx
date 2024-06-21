import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useVisibleColumnSizes,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
    columnGroup: 'info',
  },

  preferredLanguage: { field: 'preferredLanguage', columnGroup: 'info' },
  stack: { field: 'stack', columnGroup: 'other' },
};

const domProps = {
  style: {
    height: '80vh',
    margin: 10,
  },
};

function Cmp() {
  const columns = useVisibleColumnSizes();

  return (
    <div style={{ overflow: 'hidden' }}>
      <InfiniteTable.HScrollSyncContent width="column">
        <div style={{ display: 'flex', flexFlow: 'row' }}>
          {columns.map((col) => {
            console.log(col);
            return (
              <div
                style={{
                  width: col.cssVarForWidth,
                  // width: col.width,
                  flex: 'none',
                  border: '1px solid magenta',
                  overflow: 'hidden',
                }}
              >
                {col.id}
              </div>
            );
          })}
        </div>
      </InfiniteTable.HScrollSyncContent>
    </div>
  );
}

export default function App() {
  const [colWidth, setColWidth] = React.useState(200);
  return (
    <>
      <button
        onClick={() => {
          setColWidth(colWidth === 200 ? 400 : colWidth === 400 ? 100 : 200);
        }}
      >
        toggle col width
      </button>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-cell"
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnGroups={{
            info: {
              header: 'info',
            },
            other: {
              header: 'other',
            },
          }}
          keyboardNavigation={'cell'}
          columnDefaultWidth={colWidth}
        >
          <InfiniteTable.Header />
          <div style={{ overflow: 'hidden' }}>
            <InfiniteTable.HScrollSyncContent maxWidth="column">
              Commodo amet do ad mollit nisi incididunt nostrud fugiat deserunt
              nisi. Minim occaecat amet commodo anim aute sunt ut et ullamco
              sit. Aliquip nisi elit culpa occaecat fugiat adipisicing aute
              voluptate eu dolore. Adipisicing ut esse occaecat ullamco laborum
              nulla. Ullamco laborum tempor non nostrud excepteur. Esse ullamco
              non ullamco quis Lorem dolor ex commodo labore voluptate laboris
              deserunt cillum. Sint reprehenderit ea labore voluptate duis Lorem
              exercitation dolore qui mollit consequat dolore occaecat aliqua.
              Ex ut aliquip consectetur id esse laborum. Anim deserunt minim
              labore pariatur sunt deserunt. Nulla dolor nulla laboris veniam eu
              dolor.
            </InfiniteTable.HScrollSyncContent>
          </div>
          <Cmp />
          <div
            style={{
              border: '2px solid white',
              marginBlock: '10px',
              height: '100%',
              flex: 1,
              display: 'flex',
            }}
          >
            <InfiniteTable.Body />
          </div>
          <InfiniteTable.Header />
          {/* <Cmp /> */}
        </InfiniteTable>
      </DataSource>
    </>
  );
}
