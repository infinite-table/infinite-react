import * as React from 'react';
import { join } from '../../../../utils/join';
import { InfiniteBodyCls } from './body.css';
import { InfiniteTableBodyClassName } from './bodyClassName';

const BodyClassName = join(InfiniteBodyCls, InfiniteTableBodyClassName);

export function InfiniteTableBodyContainer(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      className={
        props.className ? join(BodyClassName, props.className) : BodyClassName
      }
    />
  );
}
