// Snippets shown on infinite-table-props.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { useMemo, useCallback, useRef } from 'react';
import {
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
  TableRenderRange,
  useInfiniteColumnCell,
  useInfiniteColumnEditor,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  city: string;
};
type DATA_TYPE = Developer;

type Employee = {
  id: number;
  name: string;
  salary: number;
};

type Sale = {
  id: number;
  segment: string;
  amount: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
declare const style: React.CSSProperties;
declare const emoji: string;
declare function averageFor(sales: Sale[], segment?: string): number;

export function ColumnCellDomRef() {
  //#region columns-components-columncell
  const { domRef } = useInfiniteColumnCell<DATA_TYPE>();
  //#endregion

  return (
    //#region columns-components-columncell-dom-ref
    <div ref={domRef}>...</div>
    //#endregion
  );
}

//#region columns-components-columncell-signature
function CustomComponent(props: React.HTMLProps<HTMLDivElement>) {
  return // ...
}
//#endregion

//#region columns-components-columncell-example
const ExampleCellComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { domRef } = useInfiniteColumnCell<Developer>();

  return (
    <div
      ref={domRef}
      {...props}
      className={`${props.className} extra-cls`}
      style={style}
    >
      {props.children} <div style={{ flex: 1 }} /> {emoji}
    </div>
  );
};
//#endregion

//#region columns-components-editor
export function InfiniteTableColumnEditor<T>() {
  const { initialValue, setValue, confirmEdit, cancelEdit, readOnly } =
    useInfiniteColumnEditor<T>();

  const domRef = useRef<HTMLInputElement | null>(null);
  const refCallback = React.useCallback((node: HTMLInputElement) => {
    domRef.current = node;

    if (node) {
      node.focus();
    }
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit();
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <>
      <input
        readOnly={readOnly}
        ref={refCallback}
        onKeyDown={onKeyDown}
        onBlur={() => confirmEdit()}
        className={'...'}
        type={'text'}
        defaultValue={initialValue}
        onChange={useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }, [])}
      />
    </>
  );
}
//#endregion

export function HeaderCellDomRef() {
  //#region columns-components-headercell
  const { domRef } = useInfiniteHeaderCell<DATA_TYPE>();
  //#endregion

  return (
    //#region columns-components-headercell-dom-ref
    <div ref={domRef}>...</div>
    //#endregion
  );
}

//#region columns-components-headercell-signature
function CustomHeaderComponent(props: React.HTMLProps<HTMLDivElement>) {
  return // ...
}
//#endregion

//#region columns-components-headercell-example
const ExampleHeaderComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { domRef } = useInfiniteHeaderCell<Developer>();

  return (
    <div
      ref={domRef}
      {...props}
      className={`${props.className} extra-cls`}
      style={style}
    >
      {props.children} <div style={{ flex: 1 }} /> {emoji}
    </div>
  );
};
//#endregion

export function ColumnGroupVisibility() {
  return (
    //#region columngroupvisibility
    <InfiniteTable<DATA_TYPE>
      columnGroupVisibility={{
        'country': false,
        'city': true,
      }}
      columns={{/* ... */}}
    />
    //#endregion
  );
}

export function repaintCellsKey() {
  //#region columns-repaintcellskey
  const columns: InfiniteTablePropColumns<Sale> = {
    segmentAverage: {
      header: 'Segment avg',
      repaintCellsKey: ({ rowInfo, dataSourceState }) =>
        averageFor(dataSourceState.originalDataArray, rowInfo.data?.segment),
      render: ({ rowInfo, dataSourceApi }) =>
        averageFor(dataSourceApi.getOriginalDataArray(), rowInfo.data?.segment),
    },
  };
  //#endregion
  return columns;
}

//#region keyboardshortcuts
import { keyboardShortcuts } from '@infinite-table/infinite-react'
//#endregion

export function cellContextMenuItems() {
  //#region getcellcontextmenuitems
  const getCellContextMenuItems = () => {
    return {
      columns: [{ name: 'label' }, { name: 'icon' }],
      items: [
        {
          label: 'Welcome',
          icon: '👋',
          key: 'hi',
        },
        {
          label: 'Convert',
          icon: '🔁',
          key: 'convert',
        },
      ],
    };
  };
  //#endregion
  const checked: InfiniteTablePropGetCellContextMenuItems<Developer> =
    getCellContextMenuItems;
  return checked;
}

export function RenderRange() {
  return (
    <InfiniteTable<Developer>
      columns={columns}
      onRenderRangeChange={(renderRange) => {
        //#region onrenderrangechange
        const [startRow, startCol] = renderRange.start;
        const [endRow, endCol] = renderRange.end;
        //#endregion
      }}
      onScrollStop={({ renderRange }) => {
        //#region onscrollstop
        const [startRow, startCol] = renderRange.start;
        const [endRow, endCol] = renderRange.end;
        //#endregion
      }}
    />
  );
}

//#region onrenderrangechange-debounced
import {
  debounce,
  InfiniteTable,
  DataSource
} from '@infinite-table/infinite-react';

function App() {
  const onRenderRangeChange = useMemo(() => {
    return debounce((range: TableRenderRange) => {
      console.log(range.start, range.end);
    }, {wait: 100});
  }, []);

  return <DataSource<Developer>
    primaryKey="id"
    data={data}
  >
    <InfiniteTable<Developer>
      onRenderRangeChange={onRenderRangeChange}
      columns={columns}
    />
  </DataSource>
}
//#endregion

//#region rowstyle
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

export {
  CustomComponent,
  ExampleCellComponent,
  CustomHeaderComponent,
  ExampleHeaderComponent,
  keyboardShortcuts,
  App,
  rowStyle,
};
