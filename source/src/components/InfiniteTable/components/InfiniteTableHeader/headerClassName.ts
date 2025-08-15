import { rootClassName } from '../../internalProps';

export const InfiniteTableHeaderCellClassName = `${rootClassName}HeaderCell`;
export const InfiniteTableHeaderWrapperClassName = `${rootClassName}HeaderWrapper`;

export const getHeaderWrapperNodes = (root: HTMLElement) => {
  return Array.from(
    root.querySelectorAll(`.${InfiniteTableHeaderWrapperClassName}`),
  );
};
