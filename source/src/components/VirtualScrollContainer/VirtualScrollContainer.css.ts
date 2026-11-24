import { style } from '@vanilla-extract/css';
import { boxSizingBorderBox } from '../InfiniteTable/utilities.css';

export const VirtualScrollContainerCls = style([
  boxSizingBorderBox,
  {
    backfaceVisibility: 'hidden',
    WebkitOverflowScrolling: 'touch',
    outline: 'none',

    /** MANDATORY BLOCK - START **/
    // `absolute`, not `fixed` (as it was until 10.2.1): the parent is
    // positioned and transformed, so both put the scroller in the same place,
    // but with `fixed` Chrome repainted every cell whenever a recycled cell got
    // new content while scrolling - about 6x more paints, 4x more paint time.
    // `absolute` also doesn't depend on the parent's transform.
    // See https://infinite-table.com/blog/2026/11/24/one-line-of-css-a-quarter-of-the-paint-work
    position: 'absolute',
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
  // transform: `translate3d(${InternalVars.virtualScrollLeftOffset}, ${InternalVars.virtualScrollTopOffset}, 0px)`,
  transform: `translate3d(0px, 0px, 0px)`,
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
