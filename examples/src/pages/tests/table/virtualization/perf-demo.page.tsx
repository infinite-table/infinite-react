import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-react';
import { useMemo, useRef, useState } from 'react';

import {
  InfiniteTableColumn,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

export interface TreeData {
  id: string;
  name: string;
  values: [number, number, number, number, number, number, number, number];
  children?: TreeData[];
}

const VALUES_COUNT = 8;
const getRandomValues = () =>
  Array.from({ length: VALUES_COUNT }, () =>
    Math.floor(Math.random() * 100),
  ) as TreeData['values'];

const generateEmptyInstrument = (id: string): TreeData => ({
  id,
  name: `Instrument ${id}`,
  values: getRandomValues(),
});
const generateStack = (id: string): TreeData => ({
  id,
  name: `Stack ${id}`,
  values: getRandomValues(),
});

export const treeData: TreeData[] = [
  {
    id: '1',
    name: 'Group 1',
    values: getRandomValues(),
    children: [
      generateEmptyInstrument('1.1'),
      {
        ...generateEmptyInstrument('1.2'),
        children: [generateStack('1.2.1'), generateStack('1.2.2')],
      },
      generateEmptyInstrument('1.3'),
      {
        ...generateEmptyInstrument('1.4'),
        children: [
          generateStack('1.4.1'),
          generateStack('1.4.2'),
          generateStack('1.4.3'),
        ],
      },
      generateEmptyInstrument('1.5'),
      generateEmptyInstrument('1.6'),
      generateEmptyInstrument('1.7'),
      generateEmptyInstrument('1.8'),
      generateEmptyInstrument('1.9'),
      generateEmptyInstrument('1.10'),
    ],
  },
  {
    id: '2',
    name: 'Group 2',
    values: getRandomValues(),
    children: [
      generateEmptyInstrument('2.1'),
      generateEmptyInstrument('2.2'),
      generateEmptyInstrument('2.3'),
      generateEmptyInstrument('2.4'),
      generateEmptyInstrument('2.5'),
      generateEmptyInstrument('2.6'),
      generateEmptyInstrument('2.7'),
      generateEmptyInstrument('2.8'),
      generateEmptyInstrument('2.9'),
      generateEmptyInstrument('2.10'),
      generateEmptyInstrument('2.11'),
      generateEmptyInstrument('2.12'),
      generateEmptyInstrument('2.13'),
      generateEmptyInstrument('2.14'),
      generateEmptyInstrument('2.15'),
      generateEmptyInstrument('2.16'),
      generateEmptyInstrument('2.17'),
      generateEmptyInstrument('2.18'),
      generateEmptyInstrument('2.19'),
      generateEmptyInstrument('2.20'),
    ],
  },
  {
    id: '3',
    name: 'Group 3',
    values: getRandomValues(),
    children: [
      generateEmptyInstrument('3.1'),
      generateEmptyInstrument('3.2'),
      generateEmptyInstrument('3.3'),
      generateEmptyInstrument('3.4'),
      generateEmptyInstrument('3.5'),
      generateEmptyInstrument('3.6'),
      generateEmptyInstrument('3.7'),
      generateEmptyInstrument('3.8'),
      generateEmptyInstrument('3.9'),
      generateEmptyInstrument('3.10'),
      generateEmptyInstrument('3.11'),
      generateEmptyInstrument('3.12'),
      generateEmptyInstrument('3.13'),
      generateEmptyInstrument('3.14'),
      generateEmptyInstrument('3.15'),
      generateEmptyInstrument('3.16'),
      generateEmptyInstrument('3.17'),
      generateEmptyInstrument('3.18'),
      generateEmptyInstrument('3.19'),
      generateEmptyInstrument('3.20'),
      generateEmptyInstrument('3.21'),
      generateEmptyInstrument('3.22'),
      generateEmptyInstrument('3.23'),
      generateEmptyInstrument('3.24'),
      generateEmptyInstrument('3.25'),
      generateEmptyInstrument('3.26'),
      generateEmptyInstrument('3.27'),
      generateEmptyInstrument('3.28'),
      generateEmptyInstrument('3.29'),
      generateEmptyInstrument('3.30'),
      generateEmptyInstrument('3.31'),
      generateEmptyInstrument('3.32'),
      generateEmptyInstrument('3.33'),
      generateEmptyInstrument('3.34'),
      generateEmptyInstrument('3.35'),
      generateEmptyInstrument('3.36'),
      generateEmptyInstrument('3.37'),
      generateEmptyInstrument('3.38'),
      generateEmptyInstrument('3.39'),
      generateEmptyInstrument('3.40'),
    ],
  },
];

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
  const [showMoreColumns, setShowMoreColumns] = useState(false);

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
      <h1>Infinite Table performance test</h1>
      <div className="dev-menu">
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
      </div>
      <div className="container">
        <TreeDataSource<TreeData>
          data={dataRef.current}
          primaryKey="id"
          nodesKey="children"
          defaultTreeExpandState={{
            defaultExpanded: false,
            expandedPaths: [],
          }}
          onReady={(api) => {
            if (!isAddedRef.current) {
              api.addDataArray(treeData);
              isAddedRef.current = true;
            }
          }}
          onDataArrayChange={(data) => {
            console.log('%c>>> TCL', 'color: #0cc', 'log ~ App ~ data:', data);
          }}
        >
          <TreeGrid<TreeData>
            header={false}
            columns={finalColumns}
            domProps={domProps}
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
    height: 800,
    width: '95vw',
  },
};
