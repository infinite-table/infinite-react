import * as React from 'react';

import { join } from '../../../../utils/join';

import { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';
import { rootClassName } from '../../internalProps';
import { cssEllipsisClassName } from '../../utilities.css';
import {
  HeaderGroupCls,
  HeaderGroup_Children,
  HeaderGroup_Header,
} from './header.css';
import { useCallback, useRef } from 'react';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

export function InfiniteTableHeaderGroup<T>(
  props: InfiniteTableHeaderGroupProps<T>,
) {
  const { columnGroup, height, headerHeight, width } = props;

  let { header } = columnGroup;

  if (header instanceof Function) {
    header = header({
      columnGroup,
    });
  }
  const style: React.CSSProperties = {
    width,
    height,
  };
  const domRef = useRef<HTMLElement | null>(null);
  const ref = useCallback(
    (node: HTMLElement | null) => {
      domRef.current = node;
      props.domRef?.(node);
    },
    [props.domRef],
  );

  return (
    <div
      ref={ref}
      data-group-id={columnGroup.id}
      className={join(HeaderGroupCls, TableHeaderGroupClassName)}
      style={style}
    >
      <div
        className={join(
          `${TableHeaderGroupClassName}__header`,
          HeaderGroup_Header,
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
          HeaderGroup_Children,
        )}
      >
        {props.children}
      </div>
    </div>
  );
}
