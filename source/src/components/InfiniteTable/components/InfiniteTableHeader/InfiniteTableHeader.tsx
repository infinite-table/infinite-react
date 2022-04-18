import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { join } from '../../../../utils/join';

import { InfiniteTableHeaderCell } from './InfiniteTableHeaderCell';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { internalProps } from '../../internalProps';

import type { InfiniteTableHeaderProps } from './InfiniteTableHeaderTypes';

import { ScrollPosition } from '../../../types/ScrollPosition';
import { HeaderClsRecipe } from './header.css';

import {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../../../HeadlessTable/ReactHeadlessTableRenderer';
import { transformTranslateZero } from '../../utilities.css';
import { RawTable } from '../../../HeadlessTable/RawTable';

const { rootClassName } = internalProps;

export const TableHeaderClassName = `${rootClassName}Header`;

function InfiniteTableHeaderFn<T>(
  props: InfiniteTableHeaderProps<T> & React.HTMLAttributes<HTMLDivElement>,
) {
  const { brain, columns, style, className } = props;

  const {
    computed,
    componentState: { headerHeight, headerBrain },
  } = useInfiniteTable<T>();

  const { computedVisibleColumnsMap } = computed;

  useEffect(() => {
    const onScroll = (scrollPosition: ScrollPosition) => {
      if (domRef.current) {
        domRef.current.style.transform = `translate3d(-${scrollPosition.scrollLeft}px, 0px, 0px)`;
      }
    };

    const removeOnScroll = brain.onScroll(onScroll);

    return removeOnScroll;
  }, [brain]);

  const domRef = useRef<HTMLDivElement | null>(null);

  const headerCls = HeaderClsRecipe({
    overflow: false,
    virtualized: true,
  });

  const domProps: React.HTMLProps<HTMLDivElement> = {
    ref: domRef,
    className: join(
      TableHeaderClassName,
      transformTranslateZero,
      `${TableHeaderClassName}--virtualized`,
      className,
      headerCls,
    ),
    style,
  };

  const renderCell: TableRenderCellFn = useCallback(
    (params: TableRenderCellFnParam) => {
      const {
        rowIndex,
        colIndex,
        domRef,
        hidden,
        widthWithColspan,
        heightWithRowspan,
      } = params;

      const column = columns[colIndex];
      if (!column) {
        return null;
      }
      return (
        <InfiniteTableHeaderCell<T>
          domRef={domRef}
          column={column}
          width={widthWithColspan}
          headerHeight={headerHeight}
          columns={computedVisibleColumnsMap}
        />
      );
    },
    [columns, headerHeight],
  );

  if (__DEV__) {
    (globalThis as any).headerBrain = headerBrain;
  }

  return (
    <div {...domProps}>
      <RawTable
        renderCell={renderCell}
        brain={headerBrain}
        cellHoverClassNames={[]}
      />
    </div>
  );
}

export const InfiniteTableHeader = React.memo(
  InfiniteTableHeaderFn,
) as typeof InfiniteTableHeaderFn;
// export const TableHeader = TableHeaderFn; //React.memo(TableHeaderFn) as typeof TableHeaderFn;
