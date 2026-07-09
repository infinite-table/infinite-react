import * as React from 'react';
import { InfiniteTable } from '../InfiniteTable';
import { TreeGridProps } from './types/TreeGridProps';

export { withSelectedLeafNodesOnly } from './treeSelectionUtils';

export function TreeGrid<T>(props: TreeGridProps<T>) {
  return <InfiniteTable {...props} />;
}
