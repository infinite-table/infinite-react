import * as React from 'react';

import { BackLink } from './BackLink';
import { FrameworkLink } from './FrameworkLink';
import { RunTestButton } from './RunTestButton';

export const PageDevChrome: React.FC = () => (
  <>
    <div
      style={{
        position: 'fixed',
        bottom: 6,
        right: 6,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <BackLink embedded />
      <RunTestButton embedded />
      <FrameworkLink current="react" embedded />
    </div>
  </>
);
