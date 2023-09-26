import * as React from 'react';
import { useEffect, useLayoutEffect, useRef, CSSProperties } from 'react';
import { stripVar } from '../../../utils/stripVar';
import { useRerender } from '../../hooks/useRerender';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../theme.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import {
  ActiveCellIndicatorCls,
  ActiveIndicatorWrapperCls,
} from './ActiveCellIndicator.css';

const { rootClassName } = internalProps;

const baseCls = `${rootClassName}-ActiveCellIndicator`;

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

export type ActiveCellIndicatorInfo = {
  index: [number, number];
  colOffset: number;
  colWidth: number;
};
type ActiveCellIndicatorProps = {
  activeCellIndex?: [number, number] | null;
  brain: MatrixBrain;
};

const ActiveStyle: CSSProperties = {
  [stripVar(InternalVars.activeCellOffsetX)]: InternalVars.activeCellColOffset,
  [stripVar(InternalVars.activeCellOffsetY)]: InternalVars.activeCellRowOffset,

  transform: `translate3d(${InternalVars.activeCellOffsetX}, ${InternalVars.activeCellOffsetY}, 0px)`,

  width: InternalVars.activeCellColWidth,
  height: InternalVars.activeCellRowHeight,
};

const ActiveCellIndicatorFn = (props: ActiveCellIndicatorProps) => {
  const { brain } = props;
  const [_rerenderId, rerender] = useRerender();

  const domRef = useRef<HTMLDivElement>(null);

  const active =
    props.activeCellIndex != null &&
    brain.getRowCount() > props.activeCellIndex[0];

  useLayoutEffect(() => {
    if (props.activeCellIndex == null) {
      return;
    }

    const rowIndex = props.activeCellIndex[0];
    const activeCellRowHeight = brain.getRowHeight(rowIndex);
    const activeCellRowOffset = brain.getItemOffsetFor(rowIndex, 'vertical');

    const node = domRef.current!;

    setInfiniteVarsOnNode(
      {
        activeCellRowHeight: `${activeCellRowHeight}px`,
        activeCellRowOffset: `${activeCellRowOffset}px`,
      },
      node,
    );
  }, [props.activeCellIndex]);

  useEffect(() => {
    const removeOnRenderCountChange = brain.onRenderCountChange(() => {
      rerender();
    });

    return () => {
      removeOnRenderCountChange();
    };
  }, [brain]);

  return (
    // #correct-scroll-size this wrapper is here in order to make the indicator not take up space in the scroll container - to reproduce: remove this and click on a row, you will see that if you scroll at the bottom, there is extra space
    <div
      className={ActiveIndicatorWrapperCls}
      data-name="active-cell"
      style={
        active
          ? {
              zIndex: `var(${columnZIndexAtIndex}-${
                props.activeCellIndex![1]
              })`,
            }
          : undefined
      }
    >
      <div
        ref={domRef}
        data-name="active-cell-indicator"
        className={`${baseCls} ${
          active
            ? ActiveCellIndicatorCls.visible
            : ActiveCellIndicatorCls.hidden
        }`}
        style={active ? ActiveStyle : undefined}
      ></div>
    </div>
  );
};

export const ActiveCellIndicator = React.memo(
  ActiveCellIndicatorFn,
) as typeof ActiveCellIndicatorFn;
