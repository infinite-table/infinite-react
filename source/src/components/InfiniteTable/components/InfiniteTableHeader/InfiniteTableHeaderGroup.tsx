import * as React from 'react';

import { join } from '../../../../utils/join';

import { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';
import { rootClassName } from '../../internalProps';
import {
  alignItems,
  display,
  flexFlow,
  cssEllipsisClassName,
} from '../../utilities.css';

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
        flexFlow.column,
        display.flex,
        TableHeaderGroupClassName,
        `${TableHeaderGroupClassName}--unvirtualized`,
      )}
      style={style}
    >
      <div
        className={join(
          `${TableHeaderGroupClassName}__header`,
          flexFlow.row,
          display.flex,
          alignItems.center,
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
          display.flex,
          flexFlow.row,
          alignItems.stretch,
        )}
      >
        {props.children}
      </div>
    </div>
  );
}
