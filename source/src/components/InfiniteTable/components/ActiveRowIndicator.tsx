import * as React from 'react';
import { CSSProperties, useEffect, useLayoutEffect, useRef } from 'react';
import { stripVar } from '../../../utils/stripVar';
import { useRerender } from '../../hooks/useRerender';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../theme.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import { ActiveIndicatorWrapperCls } from './ActiveCellIndicator.css';
import { ActiveRowIndicatorCls } from './ActiveRowIndicator.css';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-ActiveRowIndicator`;

type ActiveRowIndicatorProps = {
  activeRowIndex?: number | null;
  brain: MatrixBrain;
};

const ActiveStyle: CSSProperties = {
  [stripVar(InternalVars.activeCellOffsetY)]: InternalVars.activeCellRowOffset,

  transform: `translate3d(0px, calc( ${
    InternalVars.activeCellOffsetY
  } + var(${stripVar(InternalVars.scrollTopForActiveRow)}, 0px)), 0px)`,
  height: InternalVars.activeCellRowHeight,
};

const ActiveRowIndicatorFn = (props: ActiveRowIndicatorProps) => {
  const { brain } = props;

  const domRef = useRef<HTMLDivElement>(null);

  const active =
    props.activeRowIndex != null && brain.getRowCount() > props.activeRowIndex;

  const [_rerenderId, rerender] = useRerender();

  useLayoutEffect(() => {
    if (props.activeRowIndex == null) {
      return;
    }

    const rowIndex = props.activeRowIndex;
    const activeCellRowHeight = brain.getRowHeight(rowIndex);
    const activeCellRowOffset = brain.getItemOffsetFor(rowIndex, 'vertical');

    const node = domRef.current!;

    const vars = {
      activeCellRowHeight: `${activeCellRowHeight}px`,
      activeCellRowOffset: `${activeCellRowOffset}px`,
    };

    setInfiniteVarsOnNode(vars, node);
  }, [props.activeRowIndex]);

  useEffect(() => {
    const removeOnScroll = brain.onScroll((scrollPosition) => {
      setInfiniteVarsOnNode(
        {
          scrollTopForActiveRow: `${-scrollPosition.scrollTop}px`,
        },
        domRef.current!,
      );
    });

    const removeOnRenderCountChange = brain.onRenderCountChange(rerender);

    return () => {
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
        className={`${baseCls} ${
          active ? ActiveRowIndicatorCls.visible : ActiveRowIndicatorCls.hidden
        }`}
        style={active ? ActiveStyle : undefined}
      ></div>
    </div>
  );
};

export const ActiveRowIndicator = React.memo(
  ActiveRowIndicatorFn,
) as typeof ActiveRowIndicatorFn;
