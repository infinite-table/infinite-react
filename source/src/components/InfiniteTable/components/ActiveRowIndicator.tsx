import * as React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRerender } from '../../hooks/useRerender';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { ActiveRowIndicatorCls } from './ActiveRowIndicator.css';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-ActiveRowIndicator`;

type ActiveRowIndicatorProps = {
  activeRowIndex?: number | null;
  brain: MatrixBrain;
};
const ActiveRowIndicatorFn = (props: ActiveRowIndicatorProps) => {
  const { brain } = props;

  const [state, setState] = useState({
    top: 0,
    rowHeight: 0,
  });

  const domRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  const active =
    props.activeRowIndex != null && brain.getRowCount() > props.activeRowIndex;

  useLayoutEffect(() => {
    if (props.activeRowIndex == null) {
      return;
    }
    setState(
      (stateRef.current = {
        top: brain.getItemOffsetFor(props.activeRowIndex, 'vertical'),
        rowHeight: brain.getRowHeight(props.activeRowIndex),
      }),
    );
  }, [props.activeRowIndex]);

  const [, rerender] = useRerender();

  useEffect(() => brain.onRenderCountChange(rerender), [brain]);

  useEffect(() => {
    return brain.onScroll((scrollPos) => {
      const node = domRef.current!;
      // #top_overflow_200k
      // initially we did this
      // node.style.transform = `translate3d(0px, ${-scrollPos.scrollTop}px, 0px)`;
      // and the indicator was also using top offset to position itself
      // and the transform was just to accomodate the scrolling
      // but seems like a css `top` > 200_000 does not behave

      const topOffset = stateRef.current.top;
      node.style.transform = `translate3d(0px, ${
        -scrollPos.scrollTop + topOffset
      }px, 0px)`;
    });
  }, [brain]);

  return (
    <div
      ref={domRef}
      className={`${baseCls} ${
        active ? ActiveRowIndicatorCls.visible : ActiveRowIndicatorCls.hidden
      }`}
      // #top_overflow_200k
      // Initially we used only `style.top` but seems like a css `top` > 200_000 does not behave
      // and is no longer positioned well by the browser
      // so we ended up with this solution - make sure data-top is kept here

      style={
        active
          ? {
              transform: `translate3d(0px, ${
                -brain.getScrollPosition().scrollTop + state.top
              }px,0)`,

              top: 0,
              height: state.rowHeight,
            }
          : undefined
      }
    ></div>
  );
};

export const ActiveRowIndicator = React.memo(
  ActiveRowIndicatorFn,
) as typeof ActiveRowIndicatorFn;
