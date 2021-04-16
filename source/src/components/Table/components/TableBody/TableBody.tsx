import * as React from 'react';
import { useInternalProps } from '../../hooks/useInternalProps';
import { join } from '../../../../utils/join';
import { ICSS } from '../../../../style/utilities';
import { Ref } from 'react';

export const TableBody = React.forwardRef(
  (props: React.HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const { rootClassName } = useInternalProps();
    return (
      <div
        ref={ref}
        {...props}
        className={join(
          `${rootClassName}Body`,
          ICSS.position.relative,
          ICSS.transform.translate3D000,
          props.className,
        )}
      />
    );
  },
);
