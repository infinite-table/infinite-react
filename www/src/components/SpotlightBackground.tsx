import * as React from 'react';
import { SpotlightHorizontalBackgroundCls } from './components.css';

export function SpotlightBackground() {
  return (
    <div
      className={SpotlightHorizontalBackgroundCls}
      style={{
        height: 500,
        width: 500,
      }}
    ></div>
  );
}
