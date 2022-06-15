import * as React from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { rootClassName } from '../../internalProps';
import { InternalVars } from '../../theme.css';
import { cssEllipsisClassName } from '../../utilities.css';

import { HeaderGroupCls } from './header.css';
import type { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);

export function InfiniteTableHeaderGroup<T>(
  props: InfiniteTableHeaderGroupProps<T>,
) {
  const { columnGroup, height, columns } = props;

  let { header } = columnGroup;

  if (header instanceof Function) {
    header = header({
      columnGroup,
    });
  }

  const width =
    columns.length > 1
      ? `calc( ` +
        columns
          .map(
            (col) => `var(${columnWidthAtIndex}-${col.computedVisibleIndex})`,
          )
          .join(' + ') +
        ' )'
      : `var(${columnWidthAtIndex}-${columns[0].computedVisibleIndex})`;

  return (
    <div
      ref={props.domRef}
      data-group-id={columnGroup.uniqueGroupId}
      className={join(HeaderGroupCls, TableHeaderGroupClassName)}
      style={{ width, height }}
    >
      <div
        className={join(
          `${TableHeaderGroupClassName}__header-content`,
          cssEllipsisClassName,
        )}
      >
        {header}
      </div>
    </div>
  );
}
