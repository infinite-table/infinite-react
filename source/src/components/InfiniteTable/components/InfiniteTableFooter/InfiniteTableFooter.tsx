import * as React from 'react';

import { join } from '../../../../utils/join';
import { useInternalProps } from '../../hooks/useInternalProps';
import { display, flexFlow, position } from '../../utilities.css';

export function InfiniteTableFooter<_T>(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  const { rootClassName } = useInternalProps();

  return (
    <div
      {...props}
      className={join(
        `${rootClassName}Footer`,
        position.relative,
        display.flex,
        flexFlow.row,
        props.className,
      )}
    ></div>
  );
}
