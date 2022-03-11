import * as React from 'react';
import {
  LoadMaskCls,
  LoadMaskOverlayCls,
  LoadMaskTextCls,
} from './LoadMask.css';
import { internalProps } from '../internalProps';

import { LoadMaskProps } from '../types/InfiniteTableProps';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-LoadMask`;

function LoadMaskFn(props: LoadMaskProps) {
  const { visible, children = 'Loading' } = props;

  return (
    <div
      className={`${LoadMaskCls[visible ? 'visible' : 'hidden']} ${baseCls}`}
    >
      <div className={`${LoadMaskOverlayCls} ${baseCls}-Overlay`}></div>
      <div className={`${LoadMaskTextCls} ${baseCls}-Text`}>{children}</div>
    </div>
  );
}

export const LoadMask = React.memo(LoadMaskFn) as typeof LoadMaskFn;
