import * as React from 'react';

import { join } from '../../../../utils/join';

import { ICSS } from '../../../../style/utilities';

import { internalProps } from '../../internalProps';
import { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';

const { rootClassName } = internalProps;
export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

export function InfiniteTableHeaderGroup<T>(
  props: InfiniteTableHeaderGroupProps<T>,
) {
  const { columnGroup } = props;

  let { header } = columnGroup;

  if (header instanceof Function) {
    header = header({
      columnGroup,
    });
  }
  const style: React.CSSProperties = {
    width: columnGroup.computedWidth,
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
      <div className={join(`${TableHeaderGroupClassName}__content`)}>
        {header}
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
