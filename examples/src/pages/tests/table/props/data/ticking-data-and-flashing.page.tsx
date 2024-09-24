import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useState } from 'react';
import {
  useTickingData,
  type Developer,
} from './ticking-data-and-flashing-use-ticking';

const dataSource = () => {
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/developers10k-sql`)
    .then((r) => r.json())
    .then((result: { data: Developer[] }) => {
      return result.data.slice(0, 1);
    });
};

const FlashingColumnCell = React.forwardRef(
  (props: React.HTMLProps<HTMLDivElement>, _ref: React.Ref<HTMLDivElement>) => {
    const { domRef, value, column, rowInfo } =
      useInfiniteColumnCell<Developer>();

    const flashBackground = 'blue';
    const [flash, setFlash] = React.useState(false);

    const rowId = rowInfo.id;
    const columnId = column.id;
    const prevValueRef = React.useRef({
      columnId,
      rowId,
      value,
    });

    console.log(
      'render',
      // props.children?.props?.children?[1].props?.children.props.children[3]
    );

    React.useEffect(() => {
      const prev = prevValueRef.current;
      if (
        prev.value !== value &&
        prev.rowId === rowId &&
        prev.columnId === columnId
      ) {
        console.log('value changed', value, 'prev', prev.value);
        setFlash(true);
        setTimeout(() => {
          setFlash(false);
        }, 500);
      }

      console.log('value updated', value);
      prevValueRef.current = {
        columnId: column.id,
        rowId: rowInfo.id,
        value,
      };
    }, [value, columnId, rowId]);

    // React.useEffect(() => {
    //   console.log('mount');
    // }, []);

    return (
      <div
        ref={domRef}
        {...props}
        style={{
          ...props.style,
          background: flash ? flashBackground : props.style?.background,
        }}
      >
        {props.children} - {value}
      </div>
    );
  },
);

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  monthlyBonus: {
    field: 'monthlyBonus',
    type: 'number',
    components: {
      ColumnCell: FlashingColumnCell,
    },
    style: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return {};
      }

      const style: React.CSSProperties = {};
      const bg =
        value > 4000
          ? 'tomato'
          : value > 2500
          ? 'orange'
          : value > 1500
          ? 'yellow'
          : value > 1000
          ? 'lightgreen'
          : null;

      if (bg) {
        style.background = bg;
        style.color = 'black';
      }

      return {};
      // return style;
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  reposCount: {
    field: 'reposCount',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
export default () => {
  const [ticking, setTicking] = useState(false);
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<Developer>>();

  useTickingData(dataSourceApi!, ticking, {
    batchSize: 20,
    interval: 50,
  });
  return (
    <>
      <React.StrictMode>
        <button onClick={() => setTicking(!ticking)}>toggle ticking</button>
        <DataSource<Developer>
          data={dataSource}
          onReady={setDataSourceApi}
          primaryKey="id"
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
            columnDefaultEditable
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
