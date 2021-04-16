import { ICSS } from '../../style/utilities';
import { join } from '../../utils/join';

export type Scrollable =
  | boolean
  | keyof typeof ICSS['overflow']
  | {
      vertical: boolean | keyof typeof ICSS['overflow'];
      horizontal: boolean | keyof typeof ICSS['overflow'];
    };

export const getScrollableClassName = (scrollable: Scrollable) => {
  let scrollableClassName = '';

  if (typeof scrollable === 'boolean') {
    scrollableClassName = scrollable
      ? ICSS.overflow.auto
      : ICSS.overflow.hidden;
  } else if (typeof scrollable === 'string') {
    scrollableClassName = ICSS.overflow[scrollable];
  } else {
    scrollableClassName = join(
      typeof scrollable.horizontal === 'boolean'
        ? scrollable.horizontal
          ? ICSS.overflowX.auto
          : ICSS.overflowX.hidden
        : ICSS.overflowX[scrollable.horizontal],
      typeof scrollable.vertical === 'boolean'
        ? scrollable.vertical
          ? ICSS.overflowY.auto
          : ICSS.overflowY.hidden
        : ICSS.overflowY[scrollable.vertical],
    );
  }
  return scrollableClassName;
};
