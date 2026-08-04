import { rootClassName } from '../../internalProps';

/**
 * Framework-neutral classnames for the column header filter, shared by the
 * React InfiniteTableColumnHeaderFilter and its Vue sibling.
 */
export const InfiniteTableColumnHeaderFilterClassName = `${rootClassName}HeaderCell__filter`;
export const InfiniteTableColumnHeaderFilterOperatorClassName = `${rootClassName}HeaderCell__filterOperator`;
export const InfiniteTableColumnHeaderFilterInputClassName = `${InfiniteTableColumnHeaderFilterClassName}__input`;
