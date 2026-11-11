import * as React from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { stripVar } from '../../../utils/stripVar';
import { useRerender } from '../../hooks/useRerender';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../internalVars.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import { getActiveCellIndicatorVars } from './activeIndicatorOffsets';
import {
  ActiveCellIndicatorRecipe,
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
  rowHeight: number | ((rowIndex: number) => number) | undefined;
};

const reposition = (
  brain: MatrixBrain,
  activeCellIndex: ActiveCellIndicatorProps['activeCellIndex'],
  rowHeight: ActiveCellIndicatorProps['rowHeight'] | undefined,
  domRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (activeCellIndex == null) {
    return;
  }

  setInfiniteVarsOnNode(
    getActiveCellIndicatorVars(brain, activeCellIndex, rowHeight),
    domRef.current,
  );
};

const ActiveCellIndicatorFn = (props: ActiveCellIndicatorProps) => {
  const { brain } = props;
  const [_rerenderId, rerender] = useRerender();

  const domRef = useRef<HTMLDivElement | null>(null);

  const active =
    props.activeCellIndex != null &&
    brain.getInitialRows() > props.activeCellIndex[0];

  useLayoutEffect(() => {
    reposition(brain, props.activeCellIndex, props.rowHeight, domRef);
  }, [props.activeCellIndex, props.rowHeight, brain]);

  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const removeOnRenderCountChange = brain.onRenderCountChange(() => {
      rerender();
    });
    // offsets are relative to the scroll origin - see largeContent.ts
    const removeOnScrollOriginChange = brain.onScrollOriginChange(() => {
      const { activeCellIndex, rowHeight } = propsRef.current;
      reposition(brain, activeCellIndex, rowHeight, domRef);
    });

    return () => {
      removeOnRenderCountChange();
      removeOnScrollOriginChange();
    };
  }, [brain]);

  return (
    // #correct-scroll-size this wrapper is here in order to make the indicator not take up space in the scroll container - to reproduce: remove this and click on a row, you will see that if you scroll at the bottom, there is extra space
    <div
      className={ActiveIndicatorWrapperCls}
      ref={domRef}
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
        data-name="active-cell-indicator"
        className={`${baseCls} ${ActiveCellIndicatorRecipe({
          visible: active,
        })}`}
      />
    </div>
  );
};

export const ActiveCellIndicator = React.memo(
  ActiveCellIndicatorFn,
) as typeof ActiveCellIndicatorFn;
