import * as React from 'react';
import { HTMLProps } from 'react';

import { VirtualRowListProps } from './types';
import { VirtualList } from './VirtualList';

import { RenderItem } from '../RawList/types';

export const VirtualRowList = (
  props: VirtualRowListProps & HTMLProps<HTMLDivElement>,
) => {
  const { rowWidth, rowHeight, renderRow, ...listProps } = props;

  const renderItem = React.useCallback<RenderItem>(
    (renderProps) => {
      return renderRow({
        domRef: renderProps.domRef,
        rowHeight: renderProps.itemSize,
        rowIndex: renderProps.itemIndex,
      });
    },
    [renderRow],
  );

  return (
    <VirtualList
      {...listProps}
      renderItem={renderItem}
      mainAxis="vertical"
      itemMainAxisSize={rowHeight}
      itemCrossAxisSize={rowWidth}
    />
  );
};
