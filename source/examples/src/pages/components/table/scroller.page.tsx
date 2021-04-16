import { VirtualScrollContainer } from '@src/components/VirtualScrollContainer';
import * as React from 'react';
import { useState } from 'react';

const App = () => {
  const [, setScrollTop] = useState<number>(0);
  return (
    <React.StrictMode>
      <div
        style={{
          margin: 20,
          transform: 'translate3d(0px, 0px, 0px)',
          border: '10px solid green',
          position: 'relative',
          width: '50vw',
          height: '50vh',
        }}
      >
        <VirtualScrollContainer
          style={{
            border: '1px solid red',
            width: 'unset',
            height: '100%',
            top: 0,
            left: 100,
            right: 0,
            position: 'absolute',
          }}
          onContainerScroll={({ scrollTop }) => {
            setScrollTop(scrollTop);
          }}
        >
          <div
            style={{
              padding: 20,
              border: '10px solid blue',
              position: 'fixed',
              // zIndex: 100,
              // transform: `translate3d(0px, ${-scrollTop}px, 0px)`,
            }}
          >
            <input />
          </div>
          <div
            style={{
              height: '200vh',
              width: '200vw',
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          ></div>
        </VirtualScrollContainer>
      </div>
    </React.StrictMode>
  );
};

export default App;
