import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

export type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  monthlyBonus: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    monthlyBonus: 1000,
    currency: 'USD',
    salary: 1000,
    preferredLanguage: 'JavaScript',
    stack: 'Frontend',
    canDesign: 'yes',
    age: 30,
    reposCount: 100,
  },
];

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

    React.useEffect(() => {
      const prev = prevValueRef.current;
      if (
        prev.value !== value &&
        prev.rowId === rowId &&
        prev.columnId === columnId
      ) {
        setFlash(true);
        setTimeout(() => {
          setFlash(false);
        }, 100);
      }

      prevValueRef.current = {
        columnId: column.id,
        rowId: rowInfo.id,
        value,
      };
    }, [value, columnId, rowId]);

    return (
      <div
        ref={domRef}
        {...props}
        style={{
          ...props.style,
          background: flash ? flashBackground : props.style?.background,
        }}
      >
        {props.children}-{value}
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
    defaultWidth: 200,
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
  return (
    <>
      <React.StrictMode>
        <p>Update the monthlyBonus field to see the flashing effect</p>
        <DataSource<Developer> data={dataSource} primaryKey="id">
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
