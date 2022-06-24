import * as React from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { rootClassName } from '../../internalProps';
import { InternalVars } from '../../theme.css';
import { cssEllipsisClassName } from '../../utilities.css';

import { HeaderGroupCls } from './header.css';
import type { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';
import { useColumnGroupResizeHandle } from './useColumnGroupResizeHandle';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);

export function InfiniteTableHeaderGroup<T>(
  props: InfiniteTableHeaderGroupProps<T>,
) {
  const {
    computed: { computedVisibleColumns },
  } = useInfiniteTable<T>();

  const { columnGroup, height, columns, bodyBrain, columnGroupsMaxDepth } =
    props;

  let { header } = columnGroup;

  if (header instanceof Function) {
    header = header({
      columnGroup,
    });
  }

  const handle = useColumnGroupResizeHandle(columns, {
    bodyBrain,
    groupHeight: height,
    columnGroup,
    columnGroupsMaxDepth,
  });

  const firstColumn = columns[0];
  const width =
    columns.length > 1
      ? `calc( ` +
        columns
          .map(
            (col) => `var(${columnWidthAtIndex}-${col.computedVisibleIndex})`,
          )
          .join(' + ') +
        ' )'
      : `var(${columnWidthAtIndex}-${firstColumn.computedVisibleIndex})`;

  // the zIndexes are bigger at groups that are at the top
  // also groups to the left have a higher zIndex
  const zIndex =
    computedVisibleColumns.length * 10 -
    firstColumn.computedVisibleIndex * 10 +
    height * (columnGroupsMaxDepth - columnGroup.depth + 2);

  return (
    <div
      ref={props.domRef}
      data-group-id={columnGroup.uniqueGroupId}
      className={join(HeaderGroupCls, TableHeaderGroupClassName)}
      style={{ width, height }}
      data-z-index={zIndex}
    >
      <div
        className={join(
          `${TableHeaderGroupClassName}__header-content`,
          cssEllipsisClassName,
        )}
      >
        {header}
      </div>
      {handle}
    </div>
  );
}
