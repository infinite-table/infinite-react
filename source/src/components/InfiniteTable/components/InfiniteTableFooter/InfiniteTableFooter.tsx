import * as React from 'react';
import { Ref } from 'react';

import { join } from '../../../../utils/join';
import { useInternalProps } from '../../hooks/useInternalProps';
import { display, flexFlow, position } from '../../utilities.css';

export const InfiniteTableFooter = React.forwardRef(
  function InfiniteTableFooter<_T>(
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: Ref<HTMLDivElement>,
  ) {
    const { rootClassName } = useInternalProps();

    return (
      <div
        ref={ref}
        {...props}
        className={join(
          `${rootClassName}Footer`,
          position.relative,
          display.flex,
          flexFlow.row,
          props.className,
        )}
      >
        {/* Showing {dataArray.length} from {unfilteredCount} */}
      </div>
    );
  },
);
