import * as React from 'react';

import { join } from '../../../../../utils/join';
import { LoadingIconCls } from './loading.css';
import { loadingIconStrokeDasharray, loadingIconSvgStyle } from './shared';
import type { LoadingIconProps } from './shared';

export const LoadingIcon = (props: LoadingIconProps<React.CSSProperties>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        ...loadingIconSvgStyle,
        ...props.style,
      }}
      width="24px"
      height="24px"
      viewBox={props.viewBox ?? '0 0 100 100'}
      preserveAspectRatio="xMidYMid"
      className={join(
        props.className,
        LoadingIconCls,
        'InfiniteIcon',
        'InfiniteIcon-loading',
      )}
    >
      <circle
        cx="50"
        cy="50"
        fill="none"
        strokeWidth="10"
        r="35"
        strokeDasharray={loadingIconStrokeDasharray}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
        />
      </circle>
    </svg>
  );
};
