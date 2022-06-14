import * as React from 'react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  CSSProperties,
} from 'react';

import { useRerender } from '../../hooks/useRerender';
import { ScrollPosition } from '../../types/ScrollPosition';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../theme.css';
import { setInfiniteVars } from '../utils/infiniteDOMUtils';
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

type ActiveCellVars = {
  scrollPosition: ScrollPosition;
  activeColWidth: number;

  activeCellOffsetX: number;
  activeCellOffsetY: number;

  activeRowHeight: number;
};

function updateInfiniteCSSVarsForActiveCell(
  vars: ActiveCellVars,
  node: HTMLElement,
) {
  setInfiniteVars(
    {
      activeCellWidth: `${vars.activeColWidth}px`,
      activeRowHeight: `${vars.activeRowHeight}px`,
      activeCellColumnTransformX: `${
        -vars.scrollPosition.scrollLeft + vars.activeCellOffsetX
      }px`,
      activeCellColumnTransformY: `${
        -vars.scrollPosition.scrollTop + vars.activeCellOffsetY
      }px`,
    },
    node,
  );
}

const DEFAULT_VARS: ActiveCellVars = {
  scrollPosition: { scrollLeft: 0, scrollTop: 0 },
  activeColWidth: 0,
  activeCellOffsetX: 0,
  activeCellOffsetY: 0,
  activeRowHeight: 0,
};

const ActiveStyle: CSSProperties = {
  transform: `translate3d(${InternalVars.activeCellColumnTransformX}, ${InternalVars.activeCellColumnTransformY},0)`,
  width: InternalVars.activeCellWidth,
  height: InternalVars.activeRowHeight,
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

  const varsRef = useRef<ActiveCellVars>(DEFAULT_VARS);

  const active =
    props.activeCellIndex != null &&
    brain.getRowCount() > props.activeCellIndex[0];

  useLayoutEffect(() => {
    if (props.activeCellIndex == null) {
      return;
    }

    const rowIndex = props.activeCellIndex[0];

    const rowHeight = brain.getRowHeight(rowIndex);

    const colWidth = brain.getColWidth(props.activeCellIndex[1]);
    const left = brain.getItemOffsetFor(props.activeCellIndex[1], 'horizontal');
    const top = brain.getItemOffsetFor(rowIndex, 'vertical');

    updateInfiniteCSSVarsForActiveCell(
      (varsRef.current = {
        scrollPosition: brain.getScrollPosition(),
        activeColWidth: colWidth,
        activeCellOffsetX: left,
        activeCellOffsetY: top,
        activeRowHeight: rowHeight,
      }),
      domRef.current!,
    );

    setState(
      (stateRef.current = {
        top: top,
        rowHeight,
        left,
        colWidth,
      }),
    );
  }, [props.activeCellIndex, rerenderId]);

  useEffect(() => {
    const removeOnSCroll = brain.onScroll((scrollPos) => {
      // #top_overflow_200k
      // initially we did this
      // node.style.transform = `translate3d(0px, ${-scrollPos.scrollTop}px, 0px)`;
      // and the indicator was also using top offset to position itself
      // and the transform was just to accomodate the scrolling
      // but seems like a css `top` > 200_000 does not behave

      const topOffset = stateRef.current.top;
      const leftOffset = stateRef.current.left;

      updateInfiniteCSSVarsForActiveCell(
        {
          ...varsRef.current,
          scrollPosition: scrollPos,
          activeColWidth: stateRef.current.colWidth,
          activeCellOffsetX: leftOffset,
          activeCellOffsetY: topOffset,
        },
        domRef.current!,
      );
      // node.style.transform = `translate3d(${
      //   -scrollPos.scrollLeft + leftOffset
      // }px, ${-scrollPos.scrollTop + topOffset}px, 0px)`;
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

      style={active ? ActiveStyle : undefined}
    ></div>
  );
};

export const ActiveCellIndicator = React.memo(
  ActiveCellIndicatorFn,
) as typeof ActiveCellIndicatorFn;
