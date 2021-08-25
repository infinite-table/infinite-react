import {
  InfiniteTableColumnGroup,
  InfiniteTableComputedColumn,
} from '../../types';
import { InfiniteTableComponentState } from '../../types/InfiniteTableState';

export type ColGroupTreeBaseItem = {
  id: string;
  groupOffset: number;
  depth: number;
  computedWidth: number;
};
export type ColGroupTreeColumnItem<T> = ColGroupTreeBaseItem & {
  type: 'column';
  ref: InfiniteTableComputedColumn<T>;
};

export type ColGroupTreeGroupItem<T> = ColGroupTreeBaseItem & {
  type: 'group';
  ref: InfiniteTableColumnGroup;

  uniqueGroupId: string[];

  children: ColGroupTreeItem<T>[];
  columnItems: ColGroupTreeColumnItem<T>[];
};
export type ColGroupTreeItem<T> =
  | ColGroupTreeColumnItem<T>
  | ColGroupTreeGroupItem<T>;

/*
 *  -----------------------------------------------------------------------------------------------
 *  |         ADDRESS       |           |                 A D D R E S S         |   contact info  |
 *  |_______________________|           |_______________________________________|_________________|
 *  |    street   | LOCATION|           |          street       |   LOCATION    |                 |
 *  |_____________|_________|___________|_______________________|_______________|                 |
 *  |   streetNo  | city    | firstName | streetName            |country|region |  email  | phone |
 *
 */

export function buildColumnAndGroupTree<T>(
  columns: InfiniteTableComputedColumn<T>[],
  columnGroups: InfiniteTableComponentState<T>['columnGroups'],
  columnGroupsDepthsMap: InfiniteTableComponentState<T>['columnGroupsDepthsMap'],
): ColGroupTreeItem<T>[] {
  /*
   * this is basically a tree with multiple top-level nodes
   * and we return the top-level nodes in the tree (we consider the table above to be a tree,
   * with first row items being the top-level nodes)
   *
   * this map contains columns or groups.
   *
   * the keys for columns are arrays with single elements, the column id
   * the keys for groups are arrays with the path from the first column in the group
   * all the way up to the group itself:
   *    - eg, for first ADDRESS group above, the key will be : ['streetNo','street','address']
   *    - eg, for the second ADDRESS group above, the key will be : ['streetName','street','address']
   *
   */
  const map: Map<string[], ColGroupTreeItem<T>> = new Map();

  /*
   *
   * We'll also need a temporary map of groups/cols items, where groups will be keyed
   * only by a single string, the group id
   *
   * eg: we need that, as for example when we reach (city=>location=>address) group, we need access to the
   * address group previously created by streetNo=>street=>address
   *
   */
  const temporaryMap: Map<string, ColGroupTreeItem<T>> = new Map();

  // this will contain all parent groups for a column:
  // eg: for streetNo, it will contain: street, address
  // eg: for city, it will contain: location, address

  const mapOfAllParentGroupsForColumns: Map<string, Set<string>> = new Map();

  columns.forEach((col, index) => {
    const colId = col.id;
    const previousColumnId = columns[index - 1]?.id ?? '';

    const parentGroups = new Set<string>();

    const parentGroupsOfPreviousColumn =
      mapOfAllParentGroupsForColumns.get(previousColumnId) ?? new Set();

    mapOfAllParentGroupsForColumns.set(colId, parentGroups);

    const colItem: ColGroupTreeColumnItem<T> = {
      type: 'column',
      id: colId,
      ref: col,
      groupOffset: 0,
      computedWidth: col.computedWidth,
      depth: col.columnGroup
        ? (columnGroupsDepthsMap.get(col.columnGroup) ?? 0) + 1
        : 0,
    };

    map.set([colId], colItem);

    let groupId = col.columnGroup;
    let colGroupItem: ColGroupTreeGroupItem<T> | undefined;
    let prevGroupItem: ColGroupTreeItem<T> | undefined = colItem;

    while (groupId) {
      const colGroup = columnGroups.get(groupId);

      if (colGroup) {
        parentGroups.add(groupId);

        const groupAbsoluteId = [colId, ...parentGroups];

        colGroupItem = parentGroupsOfPreviousColumn.has(groupId)
          ? (temporaryMap.get(groupId) as ColGroupTreeGroupItem<T> | undefined)
          : undefined;

        if (!colGroupItem) {
          colGroupItem = {
            id: groupId,

            type: 'group',
            ref: colGroup,
            columnItems: [],
            children: [],
            groupOffset: 0,
            uniqueGroupId: [groupId],
            computedWidth: 0,
            depth: columnGroupsDepthsMap.get(groupId) ?? 0,
          };
          map.set(groupAbsoluteId, colGroupItem);
          temporaryMap.set(groupId, colGroupItem);
        }

        colGroupItem.columnItems.push(colItem);
        colGroupItem.uniqueGroupId.push(colItem.id);

        if (
          prevGroupItem &&
          !parentGroupsOfPreviousColumn.has(prevGroupItem.id)
        ) {
          colGroupItem.children.push(prevGroupItem);
        }

        prevGroupItem = colGroupItem;

        groupId = colGroup.columnGroup;
      } else {
        break;
      }
    }
  });

  const result: ColGroupTreeItem<T>[] = [];

  let groupOffset = 0;

  // get the root nodes from the tree
  // - the root nodes  are the nodes without a parent column group
  map.forEach((item) => {
    if (!item.ref.columnGroup) {
      const itemWidth =
        item.type === 'column'
          ? item.ref.computedWidth
          : item.columnItems.reduce(
              (sum, col) => sum + col.ref.computedWidth,
              0,
            );

      item.groupOffset = groupOffset;
      item.computedWidth = itemWidth;

      if (item.type === 'group') {
        assignGroupOffsetsAndComputedWidths(item.children);
      }
      result.push(item);

      groupOffset += itemWidth;
    }
  });

  map.clear();
  temporaryMap.clear();

  return result;
}

function assignGroupOffsetsAndComputedWidths<T>(
  items: ColGroupTreeItem<T>[],
  groupOffset = 0,
) {
  items.forEach((item) => {
    const itemWidth =
      item.type === 'column'
        ? item.ref.computedWidth
        : item.columnItems.reduce((sum, col) => sum + col.ref.computedWidth, 0);

    item.computedWidth = itemWidth;
    item.groupOffset = groupOffset;
    if (item.type === 'group') {
      assignGroupOffsetsAndComputedWidths(item.children);
    }

    groupOffset += itemWidth;
  });
}
