import { join } from '../../utils/join';
import {
  ScrollableCls,
  ScrollableHorizontalCls,
  ScrollableVerticalCls,
} from './VirtualScrollContainer.css';

type ScrollType = 'hidden' | 'visible' | 'auto';

export type Scrollable =
  | boolean
  | ScrollType
  | {
      vertical: boolean | ScrollType;
      horizontal: boolean | ScrollType;
    };

export const getScrollableClassName = (scrollable: Scrollable) => {
  let scrollableClassName = '';

  if (typeof scrollable === 'boolean' || typeof scrollable === 'string') {
    scrollableClassName = ScrollableCls[`${scrollable}`];
  } else {
    scrollableClassName = join(
      ScrollableHorizontalCls[`${scrollable.horizontal}`],
      ScrollableVerticalCls[`${scrollable.vertical}`],
    );
  }
  return scrollableClassName;
};
