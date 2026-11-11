import * as React from 'react';
import { CSSProperties, useEffect, useLayoutEffect, useRef } from 'react';
import { stripVar } from '../../../utils/stripVar';
import { useRerender } from '../../hooks/useRerender';
import { ScrollPosition } from '../../types/ScrollPosition';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../internalVars.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import { ThemeVars } from '../vars.css';
import { ActiveIndicatorWrapperCls } from './ActiveCellIndicator.css';
import { ActiveRowIndicatorRecipe } from './ActiveRowIndicator.css';
import {
  getActiveRowIndicatorScrollVars,
  getActiveRowIndicatorVars,
} from './activeIndicatorOffsets';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-ActiveRowIndicator`;

type ActiveRowIndicatorProps = {
  activeRowIndex?: number | null;
  brain: MatrixBrain;
};

const transformX = `calc(${InternalVars.activeCellRowOffsetX} + var(${stripVar(
  InternalVars.scrollLeftForActiveRowWhenHorizontalLayout,
)}, 0px))`;

const ActiveStyle: CSSProperties = {
  [stripVar(InternalVars.activeCellOffsetY)]: InternalVars.activeCellRowOffset,

  transform: `translate3d(${transformX}, calc( ${
    InternalVars.activeCellOffsetY
  } + var(${stripVar(InternalVars.scrollTopForActiveRow)}, 0px)), 0px)`,
  height: InternalVars.activeCellRowHeight,
  maxWidth: ThemeVars.runtime.totalVisibleColumnsWidthVar,
};

const ActiveRowIndicatorFn = (props: ActiveRowIndicatorProps) => {
  const { brain } = props;

  const domRef = useRef<HTMLDivElement>(null);

  const active =
    props.activeRowIndex != null &&
    brain.getInitialRows() > props.activeRowIndex;

  const [_rerenderId, rerender] = useRerender();

  const activeRowIndexRef = useRef(props.activeRowIndex);
  activeRowIndexRef.current = props.activeRowIndex;

  const reposition = () => {
    const activeRowIndex = activeRowIndexRef.current;
    if (activeRowIndex == null || !domRef.current) {
      return;
    }
    setInfiniteVarsOnNode(
      getActiveRowIndicatorVars(brain, activeRowIndex),
      domRef.current,
    );
  };

  useLayoutEffect(reposition, [props.activeRowIndex, brain]);

  useEffect(() => {
    const updateVars = (scrollPosition: ScrollPosition) => {
      setInfiniteVarsOnNode(
        getActiveRowIndicatorScrollVars(brain, scrollPosition),
        domRef.current!,
      );
    };

    updateVars(brain.getScrollPosition());
    const removeOnScroll = brain.onScroll(updateVars);

    const removeOnRenderCountChange = brain.onRenderCountChange(rerender);
    // offsets are relative to the scroll origin - see largeContent.ts
    const removeOnScrollOriginChange = brain.onScrollOriginChange(reposition);

    return () => {
      removeOnScrollOriginChange();
      removeOnRenderCountChange();
      removeOnScroll();
    };
  }, [brain]);

  return (
    // #correct-scroll-size this wrapper is here in order to make the indicator not take up space in the scroll container - to reproduce: remove this and click on a row, you will see that if you scroll at the bottom, there is extra space
    <div className={ActiveIndicatorWrapperCls} data-name="active-row">
      <div
        ref={domRef}
        data-name="active-row-indicator"
        className={`${baseCls} ${ActiveRowIndicatorRecipe({
          active,
        })}`}
        style={active ? ActiveStyle : undefined}
      />
    </div>
  );
};

export const ActiveRowIndicator = React.memo(
  ActiveRowIndicatorFn,
) as typeof ActiveRowIndicatorFn;
