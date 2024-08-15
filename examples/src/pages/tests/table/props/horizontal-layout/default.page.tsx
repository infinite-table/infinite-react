import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
  useDataSourceState,
  type DataSourceData,
  type InfiniteTableRowInfo,
  type DataSourceApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

const colors = [
  `rgb(255 0 0 / 12%)`,
  `rgb(0 255 0 / 12%)`,
  `rgb(0 0 255 / 12%)`,
  `rgb(255 255 0 / 12%)`,
  `rgb(0 255 255 / 12%)`,
  `rgb(255 0 255 / 12%)`,
];

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
  monthlyBonus: number;
  age: number;
};

function getFieldFromColumnId(columnId: string) {
  return columnId.split('-')[0] || '';
}
function getIndexFromColumnId(columnId: string) {
  return Number(columnId.split('-')[1] || 0);
}

function getDataSource(size: string) {
  const dataSource: DataSourceData<Developer> = ({ sortInfo }) => {
    if (sortInfo && !Array.isArray(sortInfo)) {
      sortInfo = [sortInfo];
    }

    const args = [
      sortInfo
        ? 'sortInfo=' +
          JSON.stringify(sortInfo.map((s) => ({ field: s.field, dir: s.dir })))
        : null,
    ]
      .filter(Boolean)
      .join('&');
    return fetch(
      process.env.NEXT_PUBLIC_BASE_URL + `/developers${size}-sql?` + args,
    ).then((r) => r.json());
  };
  return dataSource;
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  preferredLanguage: { field: 'preferredLanguage', defaultWidth: 110 },
  age: { field: 'age', defaultWidth: 70 },
  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 100,
  },
  monthlyBonus: {
    field: 'monthlyBonus',
    defaultWidth: 100,
    type: 'number',
  },
  currency: { field: 'currency', defaultWidth: 80, type: 'number' },
  firstName: { field: 'firstName', defaultWidth: 100 },
  country: { field: 'country', defaultWidth: 100 },
};

const COLUMN_KEYS = Object.keys(columns);

const getCurrentColumns = (options: {
  pageCount: number;
  pageSize: number;
  dataArray: InfiniteTableRowInfo<Developer>[];
}) => {
  const { pageCount, pageSize, dataArray } = options;
  const cols: InfiniteTablePropColumns<Developer> = {};

  for (let i = 0; i < pageCount; i++) {
    COLUMN_KEYS.forEach((key) => {
      const newCol = { ...columns[key] };
      if (key === 'salary' || key == 'monthlyBonus') {
        newCol.components = { ColumnCell: FlashingColumnCell };
      }

      newCol.headerStyle = {
        background: colors[i % colors.length],
      };
      const field = newCol.field;
      newCol.header = field;
      delete newCol.field;

      newCol.valueFormatter = (param) => {
        const { value } = param;
        return value;
      };

      //@ts-ignore
      newCol.pageSize = pageSize;
      newCol.renderValue = ({ rowInfo }) => {
        const dataItem = dataArray[i * pageSize + rowInfo.indexInAll]?.data;
        //@ts-ignore
        return dataItem?.[field];
      };

      cols[`${key}-${i}`] = newCol;
    });
  }

  return cols;
};

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const FlashingColumnCell = React.forwardRef(function (
  props: React.HTMLProps<HTMLDivElement>,
  ref,
) {
  const domRef = React.useRef<HTMLDivElement | null>(null);

  const currentRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (ref as React.RefCallback<HTMLDivElement>)(node);
      domRef.current = node;
    },
    [ref],
  );
  const timesChangedRef = React.useRef(0);

  const { column, rowInfo } = useInfiniteColumnCell();
  const { dataArray } = useDataSourceState();
  const rowIndex = getIndexFromColumnId(column.id);

  //@ts-ignore
  const pageSize = column.pageSize || 10;
  const dataItem: any =
    dataArray[rowIndex * pageSize + rowInfo.indexInAll]?.data || {};

  const field = getFieldFromColumnId(column.id);
  const value = dataItem?.[field];

  React.useEffect(() => {
    timesChangedRef.current = 0;
  }, [column.id, rowInfo.id]);

  React.useEffect(() => {
    if (!domRef.current) {
      return;
    }
    if (!value) {
      return;
    }

    timesChangedRef.current++;

    if (timesChangedRef.current < 2) {
      return;
    }

    domRef.current.style.backgroundColor = 'tomato';
    const timeoutId = setTimeout(() => {
      domRef.current!.style.backgroundColor = '';
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [column.id, value]);

  return <div {...props} ref={currentRef} />;
});

const dataSource = getDataSource('4k');
const domProps = { style: { height: '90vh' } };

export default function App() {
  const [api, setApi] = React.useState<DataSourceApi<Developer> | null>(null);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (!api) {
        return;
      }

      const id1 = getRandomInt(0, 100);
      const id2 = getRandomInt(0, 100);
      const id3 = getRandomInt(100, 400);

      const data1 = {
        id: id1,
        salary: getRandomInt(20000, 300000),
      };

      const data2 = {
        id: id2,
        monthlyBonus: getRandomInt(100, 5000),
      };

      const data3 = {
        id: id3,
        salary: getRandomInt(20000, 300000),
      };

      api.updateData(data1);
      api.updateData(data2);
      api.updateData(data3);
    }, 20);

    return () => {
      clearInterval(intervalId);
    };
  }, [api]);

  return (
    <DataSource<Developer>
      primaryKey="id"
      batchOperationDelay={150}
      onReady={setApi}
      data={dataSource}
    >
      <HorizontalGrid />
    </DataSource>
  );
}

function HorizontalGrid() {
  const dataArray = useDataSourceState<Developer>().dataArray;

  const [cols, setCols] = React.useState(
    getCurrentColumns({
      pageCount: 1,
      pageSize: 0,
      dataArray,
    }),
  );

  const [pageSize, setPageSize] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [wrapRowsHorizontally, setWrapRowsHorizontally] = React.useState(true);

  React.useEffect(() => {
    setCols(
      getCurrentColumns({
        pageCount,
        pageSize,
        dataArray,
      }),
    );
  }, [dataArray, pageCount, pageSize]);

  const onWrapRowsHorizontallyPageCountChange = React.useCallback(
    (options: { pageCount: number; pageSize: number }) => {
      if (options.pageCount === pageCount) {
        return;
      }

      setPageCount(options.pageCount);
      setPageSize(options.pageSize);
    },
    [],
  );

  return (
    <>
      <button
        onClick={() => {
          setWrapRowsHorizontally(!wrapRowsHorizontally);
        }}
      >
        Toggle wrap rows
      </button>

      <InfiniteTable<Developer>
        wrapRowsHorizontally={wrapRowsHorizontally}
        onWrapRowsHorizontallyPageCountChange={
          onWrapRowsHorizontallyPageCountChange
        }
        showZebraRows={false}
        domProps={domProps}
        columns={wrapRowsHorizontally ? cols : columns}
        columnDefaultSortable={false /*for now*/}
        columnOrder={true}
        columnDefaultWidth={220}
      />
    </>
  );
}
