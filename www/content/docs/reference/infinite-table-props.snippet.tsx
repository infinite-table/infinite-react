// Snippets shown on infinite-table-props.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { useMemo, useCallback, useRef } from 'react';
import {
  InfiniteTablePropColumns,
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
  useInfiniteColumnCell,
  useInfiniteColumnEditor,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

{
  //#region columns-components-columncell
  const { domRef } = useInfiniteColumnCell<DATA_TYPE>();
  //#endregion
}

{
  //#region columns-components-columncell-2
  <div ref={domRef}>...</div>
  //#endregion
}

{
  //#region columns-components-columncell-3
  function CustomComponent(props: React.HTMLProps<HTMLDivElement>) {
    return ...
  }
  //#endregion
}

{
  //#region columns-components-columncell-4
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
}

//#region columns-components-editor
export function InfiniteTableColumnEditor<T>() {
  const { initialValue, setValue, confirmEdit, cancelEdit, readOnly } =
    useInfiniteColumnEditor<T>();

  const domRef = useRef<HTMLInputElement>();
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

{
  //#region columns-components-headercell
  const { domRef } = useInfiniteHeaderCell<DATA_TYPE>();
  //#endregion
}

{
  //#region columns-components-headercell-2
  <div ref={domRef}>...</div>
  //#endregion
}

{
  //#region columns-components-headercell-3
  function CustomHeaderComponent(props: React.HTMLProps<HTMLDivElement>) {
    return ...
  }
  //#endregion
}

{
  //#region columns-components-headercell-4
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
}

{
  //#region columngroupvisibility
  <InfiniteTable<DATA_TYPE>
    columnGroupVisibility={{
      'country': false,
      'city': true,
    }}
    columns={{...}}
  />
  //#endregion
}

{
  //#region columns-repaintcellskey
  const columns: InfiniteTablePropColumns<Sale> = {
    segmentAverage: {
      header: 'Segment avg',
      repaintCellsKey: ({ rowInfo, dataSourceState }) =>
        averageFor(dataSourceState.originalDataArray, rowInfo.data.segment),
      render: ({ rowInfo, dataSourceApi }) =>
        averageFor(dataSourceApi.getOriginalDataArray(), rowInfo.data.segment),
    },
  };
  //#endregion
}

//#region keyboardshortcuts
import { keyboardShortcuts } from '@infinite-table/infinite-react'
//#endregion

{
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
}

{
  //#region onrenderrangechange
  const [startRow, startCol] = renderRange.start;
  const [endRow, endCol] = renderRange.end;
  //#endregion
}

//#region onrenderrangechange-2
import {
  debounce,
  InfiniteTable,
  DataSource
} from '@infinite-table/infinite-react';

function App() {
  const onRenderRangeChange = useMemo(() => {
    return debounce((range) => {
      console.log(range.start, range.end);
    }, {wait: 100});
  }, []);

  return <DataSource<Developer>
    primaryKey="id"
    data={/*data*/}
  >
    <InfiniteTable<Developer>
      onRenderRangeChange={onRenderRangeChange}
      columns={/*columns*/}
    />
  </DataSource>
}
//#endregion

{
  //#region onscrollstop
  const [startRow, startCol] = renderRange.start;
  const [endRow, endCol] = renderRange.end;
  //#endregion
}

{
  //#region rowstyle
  const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
    data,
    rowInfo,
  }: {
    data: Employee | null;
    rowInfo: InfiniteTableRowInfo<Employee>;
  }) => {
    const salary = data ? data.salary : 0;

    if (salary > 150_000) {
      return { background: 'tomato' };
    }
    if (rowInfo.indexInAll % 10 === 0) {
      return { background: 'lightblue', color: 'black' };
    }
  };
  //#endregion
}

export {};
