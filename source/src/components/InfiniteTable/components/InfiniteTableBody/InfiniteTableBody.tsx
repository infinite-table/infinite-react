import * as React from 'react';
import { Ref } from 'react';

import { useInternalProps } from '../../hooks/useInternalProps';
import { join } from '../../../../utils/join';
import { ICSS } from '../../../../style/utilities';

export const InfiniteTableBody = React.forwardRef(function InfiniteTableBody(
  props: React.HTMLAttributes<HTMLDivElement>,
  ref: Ref<HTMLDivElement>,
) {
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
});
