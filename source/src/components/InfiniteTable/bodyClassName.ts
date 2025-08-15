import { rootClassName } from './internalProps';

export const InfiniteTableBodyClassName = `${rootClassName}Body`;

export const getBodyNode = (root: HTMLElement) => {
  return root.querySelector(`.${InfiniteTableBodyClassName}`);
};
