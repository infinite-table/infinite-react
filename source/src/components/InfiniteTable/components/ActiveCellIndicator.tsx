import * as React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRerender } from '../../hooks/useRerender';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { ActiveCellIndicatorCls } from './ActiveCellIndicator.css';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-ActiveCellIndicator`;

export type ActiveCellIndicatorInfo = {
  index: [number, number];
  colOffset: number;
  colWidth: number;
};
type ActiveCellIndicatorProps = {
  activeCellIndex?: [number, number] | null;
  brain: MatrixBrain;
};
const ActiveCellIndicatorFn = (props: ActiveCellIndicatorProps) => {
  const { brain } = props;

  const [rerenderId, rerender] = useRerender();

  const [state, setState] = useState({
    top: 0,
    rowHeight: 0,
    colWidth: 0,
    left: 0,
  });

  const domRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  const active =
    props.activeCellIndex != null &&
    brain.getRowCount() > props.activeCellIndex[0];

  useLayoutEffect(() => {
    if (props.activeCellIndex == null) {
      return;
    }

    const rowIndex = props.activeCellIndex[0];
    setState(
      (stateRef.current = {
        top: brain.getItemOffsetFor(rowIndex, 'vertical'),
        rowHeight: brain.getRowHeight(rowIndex),
        left: brain.getItemOffsetFor(props.activeCellIndex[1], 'horizontal'),
        colWidth: brain.getColWidth(props.activeCellIndex[1]),
      }),
    );
  }, [props.activeCellIndex, rerenderId]);

  useEffect(() => {
    const removeOnSCroll = brain.onScroll((scrollPos) => {
      const node = domRef.current!;
      // #top_overflow_200k
      // initially we did this
      // node.style.transform = `translate3d(0px, ${-scrollPos.scrollTop}px, 0px)`;
      // and the indicator was also using top offset to position itself
      // and the transform was just to accomodate the scrolling
      // but seems like a css `top` > 200_000 does not behave

      const topOffset = stateRef.current.top;
      const leftOffset = stateRef.current.left;
      node.style.transform = `translate3d(${
        -scrollPos.scrollLeft + leftOffset
      }px, ${-scrollPos.scrollTop + topOffset}px, 0px)`;
    });

    const removeOnRenderCountChange = brain.onRenderCountChange(() => {
      rerender();
    });

    const removeOnAvailableSizeChange = brain.onAvailableSizeChange(() => {
      rerender();
    });

    return () => {
      removeOnAvailableSizeChange();
      removeOnRenderCountChange();
      removeOnSCroll();
    };
  }, [brain]);

  const scrollPosition = brain.getScrollPosition();

  return (
    <div
      ref={domRef}
      data-name="active-cell-indicator"
      className={`${baseCls} ${
        active ? ActiveCellIndicatorCls.visible : ActiveCellIndicatorCls.hidden
      }`}
      // #top_overflow_200k
      // Initially we used only `style.top` but seems like a css `top` > 200_000 does not behave
      // and is no longer positioned well by the browser
      // so we ended up with this solution - make sure data-top is kept here

      style={
        active
          ? {
              transform: `translate3d(${
                -scrollPosition.scrollLeft + state.left
              }px, ${-scrollPosition.scrollTop + state.top}px,0)`,
              width: state.colWidth,
              height: state.rowHeight,
            }
          : undefined
      }
    ></div>
  );
};

export const ActiveCellIndicator = React.memo(
  ActiveCellIndicatorFn,
) as typeof ActiveCellIndicatorFn;
