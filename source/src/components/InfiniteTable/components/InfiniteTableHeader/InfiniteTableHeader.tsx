import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { join } from '../../../../utils/join';
import { RawTable } from '../../../HeadlessTable/RawTable';

import {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../../../HeadlessTable/rendererTypes';

import { internalProps } from '../../internalProps';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';
import { CELL_DETACHED_CLASSNAMES } from '../cellDetachedCls';

import { HeaderClsRecipe } from './header.css';
import { InfiniteTableHeaderCell } from './InfiniteTableHeaderCell';
import { InfiniteTableHeaderGroup } from './InfiniteTableHeaderGroup';
import type { InfiniteTableInternalHeaderProps } from './InfiniteTableHeaderTypes';
import type { ScrollPosition } from '../../../types/ScrollPosition';
import { DragList } from '../draggable';
import { useInfiniteTableSelector } from '../../hooks/useInfiniteTableSelector';
import { InfiniteTableComputedColumn } from '../../types';
import {
  useDataSourceSelector,
  useDataSourceStableContext,
} from '../../../DataSource/publicHooks/useDataSourceSelector';

const { rootClassName } = internalProps;

const EMPTY_ARR: string[] = [];

export const TableHeaderClassName = `${rootClassName}Header`;

const headerCls = HeaderClsRecipe({
  overflow: false,
});

const emptyFn = () => {};

function InfiniteTableInternalHeaderFn<T>(
  props: InfiniteTableInternalHeaderProps<T> &
    React.HTMLAttributes<HTMLDivElement>,
) {
  const {
    bodyBrain,
    headerBrain,
    columns,
    style,
    className,
    columnHeaderHeight,
    columnAndGroupTreeInfo,

    columnGroupsMaxDepth,
  } = props;

  const {
    getState,
    headerOptions,
    headerRenderer,
    headerOnRenderUpdater,
    showColumnFilters,
    computedColumnsMap,
  } = useInfiniteTableSelector((ctx) => {
    return {
      computedColumnsMap: ctx.computed.computedColumnsMap as Map<
        string,
        InfiniteTableComputedColumn<T>
      >,
      getState: ctx.getState,
      headerOptions: ctx.state.headerOptions,
      headerRenderer: ctx.state.headerRenderer,
      headerOnRenderUpdater: ctx.state.headerOnRenderUpdater,
      showColumnFilters: ctx.state.showColumnFilters,
    };
  });

  const domRef = useRef<HTMLDivElement | null>(null);
  const updateDOMTransform = useCallback((scrollPosition: ScrollPosition) => {
    if (domRef.current) {
      domRef.current.style.transform = `translate3d(-${scrollPosition.scrollLeft}px, 0px, 0px)`;
    }
  }, []);

  useEffect(() => {
    const removeOnScroll = headerBrain.onScroll(updateDOMTransform);

    // useful when the brain is changed - when toggling the value of wrapRowsHorizontally
    updateDOMTransform(
      headerBrain.getScrollPosition() || { scrollLeft: 0, scrollTop: 0 },
    );

    return removeOnScroll;
  }, [headerBrain]);

  const domProps: React.HTMLProps<HTMLDivElement> = {
    ref: domRef,
    className: join(
      TableHeaderClassName,
      `${TableHeaderClassName}--virtualized`,
      className,
      headerCls,
    ),
    style: { ...style, height: columnHeaderHeight },
  };

  const { getDataSourceState, dataSourceApi, dataSourceActions } =
    useDataSourceStableContext<T>();

  const {
    allRowsSelected,
    someRowsSelected,
    selectionMode,
    filterTypes,
    filterDelay,
  } = useDataSourceSelector((ctx) => {
    return {
      allRowsSelected: ctx.dataSourceState.allRowsSelected,
      someRowsSelected: ctx.dataSourceState.someRowsSelected,
      selectionMode: ctx.dataSourceState.selectionMode,
      filterTypes: ctx.dataSourceState.filterTypes,
      filterDelay: ctx.dataSourceState.filterDelay,
    };
  });

  const dataSourceStatePartialForHeaderCell = useMemo(() => {
    return {
      allRowsSelected,
      someRowsSelected,
      selectionMode,
    };
  }, [allRowsSelected, someRowsSelected, selectionMode]);

  const renderCell: TableRenderCellFn = useCallback(
    (params: TableRenderCellFnParam) => {
      const {
        rowIndex,
        colIndex,
        domRef,
        height,
        widthWithColspan,
        heightWithRowspan,
        hidden,
      } = params;

      const column = columns[colIndex];
      if (!column || hidden) {
        return null;
      }
      const horizontalLayoutPageIndex = headerBrain.isHorizontalLayoutBrain
        ? headerBrain.getPageIndexForRow(rowIndex)
        : null;
      const colGroupItem = columnAndGroupTreeInfo
        ? columnAndGroupTreeInfo.pathsToCells.get([rowIndex, colIndex])
        : null;

      if (colGroupItem && colGroupItem.type === 'group') {
        const columns = colGroupItem.columnItems.map((item) => item.ref);
        const computedColumnGroup: InfiniteTableComputedColumnGroup = {
          ...colGroupItem.ref,
          id: colGroupItem.id,
          uniqueGroupId: colGroupItem.uniqueGroupId,
          depth: colGroupItem.depth,
          columns: columns.map((c) => c.id),
          computedWidth: colGroupItem.computedWidth,
          groupOffset: colGroupItem.groupOffset,
        };
        const visible =
          getState().columnGroupVisibility[colGroupItem.id] !== false;

        return visible ? (
          <InfiniteTableHeaderGroup
            horizontalLayoutPageIndex={horizontalLayoutPageIndex}
            bodyBrain={bodyBrain}
            columnGroupsMaxDepth={columnGroupsMaxDepth}
            domRef={domRef}
            columns={columns}
            width={widthWithColspan}
            height={height}
            columnGroup={computedColumnGroup}
          />
        ) : null;
      }

      return (
        <InfiniteTableHeaderCell<T>
          domRef={domRef}
          column={column}
          horizontalLayoutPageIndex={horizontalLayoutPageIndex}
          headerOptions={headerOptions}
          dataSourceStatePartialForHeaderCell={
            dataSourceStatePartialForHeaderCell
          }
          filterTypes={filterTypes}
          filterDelay={filterDelay}
          getDataSourceState={getDataSourceState}
          dataSourceApi={dataSourceApi}
          dataSourceActions={dataSourceActions}
          width={widthWithColspan}
          height={heightWithRowspan}
          columnsMap={computedColumnsMap}
        />
      );
    },

    // leave columnHeaderHeight here, as it's needed even
    // since it can change - eg, when the corresponding CSS variable changes
    // do it needs to trigger a re-render
    [
      headerOptions,
      columns,
      columnHeaderHeight,
      columnAndGroupTreeInfo,
      columnGroupsMaxDepth,
      showColumnFilters,
      headerBrain,
      getDataSourceState,
      dataSourceApi,
      dataSourceActions,
      filterTypes,
      filterDelay,
      dataSourceStatePartialForHeaderCell,
    ],
  );

  return (
    <DragList
      orientation="horizontal"
      dragListId="header"
      onDrop={emptyFn}
      updatePosition={emptyFn}
    >
      {(dragListDomProps) => {
        return (
          <div
            {...dragListDomProps}
            {...domProps}
            className={join(dragListDomProps.className, domProps.className)}
          >
            <RawTable
              name="header"
              renderCell={renderCell}
              brain={headerBrain}
              renderer={headerRenderer}
              onRenderUpdater={headerOnRenderUpdater}
              cellHoverClassNames={EMPTY_ARR}
              cellDetachedClassNames={CELL_DETACHED_CLASSNAMES}
            />
          </div>
        );
      }}
    </DragList>
  );
}

export const InfiniteTableInternalHeader = React.memo(
  InfiniteTableInternalHeaderFn,
) as typeof InfiniteTableInternalHeaderFn;
