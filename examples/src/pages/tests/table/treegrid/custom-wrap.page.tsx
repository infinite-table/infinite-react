import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTablePropColumns,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';
import { treeData, TreeData } from './custom-wrap-data';
import { useMemo, useRef, useState } from 'react';

const defaultProps: InfiniteTableColumn<TreeData> = {
  resizable: false,
  defaultDraggable: false,
  defaultEditable: false,
  renderMenuIcon: false,
  defaultFilterable: false,
  defaultSortable: false,
  verticalAlign: 'center',
  style: {
    textAlign: 'left',
  },
  headerAlign: 'start',
  maxWidth: 60,
};

export const columns: InfiniteTablePropColumns<
  TreeData,
  InfiniteTableColumn<TreeData>
> = {
  id: {
    ...defaultProps,
    header: 'ID',
    field: 'id',
    maxWidth: 60,
  },
  name: {
    ...defaultProps,
    header: 'NAME',
    field: 'name',
    renderTreeIcon: true,
    maxWidth: 200,
    style: (params) =>
      params.data?.children && params.data.name?.startsWith('Instrument')
        ? { background: '#a00' }
        : {},
  },
  value1: {
    ...defaultProps,
    header: '1',
    field: 'values',
    valueGetter: (params) => params.data.values[0],
  },
  value2: {
    ...defaultProps,
    header: '2',
    field: 'values',
    valueGetter: (params) => params.data.values[1],
  },
  value3: {
    ...defaultProps,
    header: '3',
    field: 'values',
    valueGetter: (params) => params.data.values[2],
  },
  value4: {
    ...defaultProps,
    header: '4',
    field: 'values',
    valueGetter: (params) => params.data.values[3],
  },
  value5: {
    ...defaultProps,
    header: '5',
    field: 'values',
    valueGetter: (params) => params.data.values[4],
  },
  value6: {
    ...defaultProps,
    header: '6',
    field: 'values',
    valueGetter: (params) => params.data.values[5],
  },
  value7: {
    ...defaultProps,
    header: '7',
    field: 'values',
    valueGetter: (params) => params.data.values[6],
  },
  value8: {
    ...defaultProps,
    header: '8',
    field: 'values',
    valueGetter: (params) => params.data.values[7],
  },
  separator: {
    minWidth: 10,
    maxWidth: 10,
    style: {
      background: 'transparent',
    },
  },
};

export default function App() {
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [showMoreColumns] = useState(false);

  const dataRef = useRef<TreeData[]>([]);
  const isAddedRef = useRef(false);

  const finalColumns = useMemo(() => {
    if (showMoreColumns) {
      return columns;
    }

    return {
      id: columns.id,
      name: columns.name,
      separator: columns.separator,
    };
  }, [showMoreColumns]);

  return (
    <div className="App">
      <h1>Infinite Table test</h1>
      <button onClick={() => setIsHorizontal(!isHorizontal)}>toggle</button>
      {/* <div className="dev-menu">
        <div>
          <input
            type="checkbox"
            name="horizontal"
            id="horizontal"
            checked={isHorizontal}
            onChange={(e) => setIsHorizontal(e.target.checked)}
          />
          <label htmlFor="horizontal">Horizontal mode</label>
        </div>
        <div>
          <input
            type="checkbox"
            name="moreColumns"
            id="moreColumns"
            checked={showMoreColumns}
            onChange={(e) => setShowMoreColumns(e.target.checked)}
          />
          <label htmlFor="moreColumns">Show more columns</label>
        </div>
      </div> */}
      <div className="container">
        <TreeDataSource<TreeData>
          data={dataRef.current}
          primaryKey="id"
          nodesKey="children"
          onReady={(api) => {
            if (!isAddedRef.current) {
              api.addDataArray(treeData);
              isAddedRef.current = true;
            }
          }}
          onDataArrayChange={(data) => {
            console.log('%c>>> TCL', 'color: #0cc', 'log ~ App ~ data:', data);
          }}
          defaultTreeExpandState={{
            defaultExpanded: true,
            collapsedPaths: [['1', '1.4']],
          }}
        >
          <TreeGrid<TreeData>
            columns={finalColumns}
            domProps={
              isHorizontal
                ? domProps
                : {
                    style: {
                      height: '100vh',
                      width: '100vw',
                    },
                  }
            }
            repeatWrappedGroupRows
            wrapRowsHorizontally={isHorizontal}
            // licenseKey={LICENSE_KEY}
          />
        </TreeDataSource>
      </div>
    </div>
  );
}

export const domProps = {
  style: {
    height: '300px',
    width: '100%',
  },
};
