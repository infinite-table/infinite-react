import { HorizontalLayoutMatrixBrain } from '@src/components/VirtualBrain/HorizontalLayoutMatrixBrain';
import { useState } from 'react';
import * as React from 'react';
import {
  VirtualScrollContainer,
  VirtualScrollContainerChildToScrollCls,
} from '@src/components/VirtualScrollContainer';
import { ScrollPosition } from '@src/components/types/ScrollPosition';
import { useResizeObserver } from '@src/components/ResizeObserver';

export default function App() {
  const [brain] = useState(() => {
    return new HorizontalLayoutMatrixBrain('horizontal-layout');
  });

  const scrollContentRef = React.useRef<HTMLDivElement>(null);
  const scrollerDOMRef = React.useRef<HTMLDivElement>(null);

  const onContainerScroll = React.useCallback((scrollPos: ScrollPosition) => {
    brain.setScrollPosition(scrollPos, () => {
      scrollContentRef.current!.style.transform = `translate3d(-${
        scrollPos.scrollLeft
      }px, ${-scrollPos.scrollTop}px, 0px)`;
    });
  }, []);

  useResizeObserver(
    scrollerDOMRef,
    (size) => {
      const bodySize = {
        width: size.width,
        height: size.height,
      };

      brain.update(bodySize);
    },
    { earlyAttach: true, debounce: 50 },
  );

  return (
    <VirtualScrollContainer
      style={{
        border: '1px solid red',
        width: 'unset',
        height: '100%',
        top: 0,
        left: '10%',
        right: '10%',
        // right: '10%',
        position: 'absolute',
      }}
      onContainerScroll={onContainerScroll}
    >
      <div
        className={VirtualScrollContainerChildToScrollCls}
        ref={scrollContentRef}
        data-name="scroll-transform-target"
        style={{
          padding: 20,
          border: '10px solid blue',
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
  );
}
