import { globalStyle, style } from '@vanilla-extract/css';
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

globalStyle(`${VirtualScrollContainerCls} > :first-child`, {
  position: 'sticky',
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
