import type { InfiniteTablePropColumnGroups } from '../types/InfiniteTableProps';
import type { InfiniteTableColumnGroupsDepthsMap } from '../types/InfiniteTableState';

export function computeColumnGroupsDepths(
  columnGroups: InfiniteTablePropColumnGroups,
  columnGroupVisibility: Record<string, boolean>,
): InfiniteTableColumnGroupsDepthsMap {
  const map = new Map();

  function isVisible(colGroupId: string) {
    return columnGroupVisibility[colGroupId] !== false;
  }

  Object.keys(columnGroups).forEach((colGroupId) => {
    const colGroup = columnGroups[colGroupId];
    let parentGroupId = colGroup.columnGroup;
    let depth = 0;

    if (!isVisible(colGroupId)) {
      depth = -1;
    }

    while (parentGroupId) {
      const parent = columnGroups[parentGroupId];

      if (!parent) {
        if (__DEV__) {
          console.warn(`Cannot find column group ${parentGroupId}`);
        }
        break;
      }
      if (isVisible(parentGroupId)) {
        depth++;
      }
      parentGroupId = parent.columnGroup;
    }
    map.set(colGroupId, depth);
  });

  return map;
}
