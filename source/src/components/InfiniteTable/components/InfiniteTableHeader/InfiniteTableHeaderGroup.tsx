import * as React from 'react';

import { join } from '../../../../utils/join';
import { ICSS } from '../../../../style/utilities';

import { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';
import { rootClassName } from '../../internalProps';
import { cssEllipsisClassName } from '../../../../style/css';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

export function InfiniteTableHeaderGroup<T>(
  props: InfiniteTableHeaderGroupProps<T>,
) {
  const { columnGroup, height, headerHeight } = props;

  let { header } = columnGroup;

  if (header instanceof Function) {
    header = header({
      columnGroup,
    });
  }
  const style: React.CSSProperties = {
    width: columnGroup.computedWidth,
    height,
  };

  return (
    <div
      data-group-id={columnGroup.id}
      className={join(
        ICSS.flexFlow.column,
        ICSS.display.flex,
        TableHeaderGroupClassName,
        `${TableHeaderGroupClassName}--unvirtualized`,
      )}
      style={style}
    >
      <div
        className={join(
          `${TableHeaderGroupClassName}__header`,
          ICSS.flexFlow.row,
          ICSS.display.flex,
          ICSS.alignItems.center,
        )}
        style={{ height: headerHeight }}
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
      <div
        className={join(
          `${TableHeaderGroupClassName}__children`,
          ICSS.display.flex,
          ICSS.flexFlow.row,
          ICSS.alignItems.stretch,
        )}
      >
        {props.children}
      </div>
    </div>
  );
}
