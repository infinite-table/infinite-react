import type { InfiniteTablePropColumnGroupsMap } from '../types/InfiniteTableProps';
import type { InfiniteTableColumnGroupsDepthsMap } from '../types/InfiniteTableState';

export function computeColumnGroupsDepths(
  columnGroups: InfiniteTablePropColumnGroupsMap,
): InfiniteTableColumnGroupsDepthsMap {
  const map = new Map();

  columnGroups.forEach((colGroup, colGroupId) => {
    let parentGroupId = colGroup.columnGroup;
    let depth = 0;

    while (parentGroupId) {
      const parent = columnGroups.get(parentGroupId);

      if (!parent) {
        if (__DEV__) {
          console.warn(`Cannot find column group ${parentGroupId}`);
        }
        break;
      }
      depth++;
      parentGroupId = parent.columnGroup;
    }
    map.set(colGroupId, depth);
  });

  return map;
}
