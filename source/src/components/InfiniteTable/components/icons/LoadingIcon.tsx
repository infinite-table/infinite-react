import { TableIconProps } from './Icon';
import * as React from 'react';
import { join } from '../../../../utils/join';
import { LoadingIconCls } from './LoadingIcon.css';

export const LoadingIcon = (props: Omit<TableIconProps, 'children'>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        margin: 'auto',
        display: 'block',
        shapeRendering: 'auto',
      }}
      width="24px"
      height="24px"
      viewBox="0 0 100 100"
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
        strokeDasharray="164.93361431346415 56.97787143782138"
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
