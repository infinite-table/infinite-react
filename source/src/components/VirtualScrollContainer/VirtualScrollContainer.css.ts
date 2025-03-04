import { style } from '@vanilla-extract/css';
import { InternalVars } from '../InfiniteTable/internalVars.css';
import { boxSizingBorderBox } from '../InfiniteTable/utilities.css';

export const VirtualScrollContainerCls = style([
  boxSizingBorderBox,
  {
    backfaceVisibility: 'hidden',
    WebkitOverflowScrolling: 'touch',
    outline: 'none',

    /** MANDATORY BLOCK - START **/
    position: 'fixed',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    /** MANDATORY BLOCK - END **/
  },
]);

// OLD: this was used before, but the perf of this CSS selector
// is not good. so we prefer to use the data-name attribute selector below
// globalStyle(`${VirtualScrollContainerCls} > :first-child`, {
//   position: 'sticky',
//   top: 0,
//   left: 0,
// });

export const VirtualScrollContainerChildToScrollCls = style({
  position: 'sticky',
  willChange: 'transform',
  transform: `translate3d(${InternalVars.virtualScrollLeftOffset}, ${InternalVars.virtualScrollTopOffset}, 0px)`,
  contain: 'size layout', // TODO THIS MIGHT MISBEHAVE!!! CAN REMOVE IF IT INTRODUCES BROWSER REPAINT/RELAYOUT BUGS
  top: 0,
  left: 0,
});

const getOverflowFor = (
  overflowProperty: 'overflow' | 'overflowX' | 'overflowY',
) => {
  return {
    true: style({
      [overflowProperty]: 'auto',
    }),
    false: style({
      [overflowProperty]: 'hidden',
    }),
    visible: style({
      [overflowProperty]: 'visible',
    }),
    auto: style({
      [overflowProperty]: 'auto',
    }),
    hidden: style({
      [overflowProperty]: 'hidden',
    }),
  };
};

export const ScrollableCls = getOverflowFor('overflow');
export const ScrollableHorizontalCls = getOverflowFor('overflowX');
export const ScrollableVerticalCls = getOverflowFor('overflowY');
