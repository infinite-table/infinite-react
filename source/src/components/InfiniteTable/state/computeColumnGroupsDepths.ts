import type { InfiniteTablePropColumnGroups } from '../types/InfiniteTableProps';
import type { InfiniteTableColumnGroupsDepthsMap } from '../types/InfiniteTableState';

export function computeColumnGroupsDepths(
  columnGroups: InfiniteTablePropColumnGroups,
): InfiniteTableColumnGroupsDepthsMap {
  const map = new Map();

  Object.keys(columnGroups).forEach((colGroupId) => {
    const colGroup = columnGroups[colGroupId];
    let parentGroupId = colGroup.columnGroup;
    let depth = 0;

    while (parentGroupId) {
      const parent = columnGroups[parentGroupId];

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
