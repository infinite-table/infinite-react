import * as React from 'react';
import { internalProps } from '../internalProps';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}LoadMask`;

type LoadMaskProps = {
  visible: boolean;
};
function LoadMaskFn(props: LoadMaskProps) {
  const { visible, ...domProps } = props;

  return (
    <div
      style={{
        display: visible ? 'flex' : 'none',

        flexFlow: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className={`${baseCls}-Overlay`}></div>
      <div
        style={{
          background: 'rgba(255,255,255,0.6)',
          position: 'relative',
          borderRadius: 4,
          opacity: 1,
          padding: 20,
        }}
      >
        Loading
      </div>
    </div>
  );
}

export const LoadMask = React.memo(LoadMaskFn) as typeof LoadMaskFn;
