import * as React from 'react';
import { CSSProperties, useCallback } from 'react';

import { ICSS } from '../../style/utilities';
import { join } from '../../utils/join';
import { VirtualBrain } from '../VirtualBrain';

import type { RenderColumn } from './types';
import type { ScrollPosition } from '../types/ScrollPosition';

import type { RenderItem, RenderItemParam } from '../RawList/types';
import { RawList } from '../RawList';

const rootClassName = 'IList';
const defaultClasses = [ICSS.position.relative, ICSS.transform.translate3D000];

export type ColumnWidth = number | ((columnWidth: number) => number);
type ColumnListExternalScrollingListProps = {
  columnWidth: ColumnWidth;

  brain: VirtualBrain;

  renderColumn: RenderColumn;

  repaintId?: number | string;
  updateScroll?: (node: HTMLElement, scrollPosition: ScrollPosition) => void;

  style?: CSSProperties;
  className?: string;
};

export const ColumnListWithExternalScrolling = (
  props: ColumnListExternalScrollingListProps,
) => {
  const {
    renderColumn,
    repaintId,

    brain,

    style,
    className,
  } = props;

  const renderItem = useCallback<RenderItem>(
    (renderProps: RenderItemParam) =>
      renderColumn({
        domRef: renderProps.domRef,
        columnWidth: renderProps.itemSize,
        columnIndex: renderProps.itemIndex,
      }),
    [renderColumn],
  );

  const domProps: React.HTMLProps<HTMLDivElement> = {
    style,
    className: join(
      className,
      rootClassName,
      `${rootClassName}--horizontal`,
      ...defaultClasses,
    ),
  };

  if (process.env.NODE_ENV === 'development') {
    (domProps as any)['data-cmp-name'] = 'ColumnListWithExternalScrolling';
  }

  return (
    <div {...domProps}>
      <RawList brain={brain} renderItem={renderItem} repaintId={repaintId} />
    </div>
  );
};
