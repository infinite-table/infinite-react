import * as React from 'react';
import { Ref } from 'react';

import { useInternalProps } from '../../hooks/useInternalProps';
import { join } from '../../../../utils/join';

import { position, transformTranslateZero } from '../../utilities.css';

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
        position.relative,
        transformTranslateZero,
        props.className,
      )}
    />
  );
});
