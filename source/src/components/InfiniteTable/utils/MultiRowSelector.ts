import { RowSelectionState } from '../../DataSource/RowSelectionState';
import { TreeSelectionState } from '../../DataSource/TreeSelectionState';

export type MultiRowSelectorRow = {
  id: any;
  isGroupRow: boolean;
  /**
   * For group rows, the keys of the group (including its own key).
   * For other rows in a grouped datasource, the keys of the parent groups.
   */
  groupKeys?: any[];
  collapsed?: boolean;
  rowDisabled?: boolean;
  /**
   * False for rows of a lazy datasource that are not loaded yet.
   */
  selfLoaded?: boolean;
  /**
   * For tree nodes, the path of the node (including its own key).
   */
  nodePath?: any[];
  isParentNode?: boolean;
  nodeExpanded?: boolean;
};

export type MultiRowSelectorOptions = {
  getRowAt: (index: number) => MultiRowSelectorRow | null | undefined;
  /**
   * For tree nodes - whether the node can be selected.
   */
  isNodeSelectable?: (row: MultiRowSelectorRow) => boolean;
};

function ensureMinMax(start: number, end: number) {
  return start < end ? [start, end] : [end, start];
}

/**
 * Applies click, cmd/ctrl+click and shift+click selection to a RowSelectionState,
 * or to a TreeSelectionState for tree data - where parent nodes work like group rows.
 *
 * A range (shift+click) covers the rows displayed from the anchor to the clicked row: normal rows
 * and collapsed group rows (as a whole) are selected, while an expanded group row with its
 * children displayed follows them, so only its rows inside the range are selected. The anchor row
 * keeps what its own click selected - a group row anchor stays selected as a whole.
 */
export class MultiRowSelector {
  getRowAt: MultiRowSelectorOptions['getRowAt'];

  multiSelectStartIndex: number = 0;
  multiSelectEndIndex?: number;

  /**
   * Checkbox changes don't carry the modifier keys, so the last cell pointer down
   * is kept to find out if shift was pressed when a selection checkbox was clicked.
   */
  lastPointerDown?: { rowIndex: number; shiftKey: boolean };

  isNodeSelectable: NonNullable<MultiRowSelectorOptions['isNodeSelectable']>;

  _rowSelectionState!: RowSelectionState;
  _treeSelectionState?: TreeSelectionState;

  constructor(options: MultiRowSelectorOptions) {
    this.getRowAt = options.getRowAt;
    this.isNodeSelectable = options.isNodeSelectable ?? (() => true);
  }

  set rowSelectionState(rowSelectionState: RowSelectionState) {
    this._rowSelectionState = rowSelectionState;
    this._treeSelectionState = undefined;
  }

  get rowSelectionState() {
    return this._rowSelectionState;
  }

  set treeSelectionState(treeSelectionState: TreeSelectionState | undefined) {
    this._treeSelectionState = treeSelectionState;
  }

  get treeSelectionState() {
    return this._treeSelectionState;
  }

  private deselectAll() {
    (this._treeSelectionState ?? this._rowSelectionState).deselectAll();
  }

  private isContainerRow(row: MultiRowSelectorRow) {
    return row.isGroupRow || !!row.isParentNode;
  }

  private isExpanded(row: MultiRowSelectorRow) {
    return row.isGroupRow ? !row.collapsed : !!row.nodeExpanded;
  }

  private getPath(row: MultiRowSelectorRow | null | undefined) {
    if (!row) {
      return undefined;
    }
    return this._treeSelectionState ? row.nodePath : this.getGroupKeys(row);
  }

  private getGroupKeys(row: MultiRowSelectorRow) {
    return row.groupKeys && row.groupKeys.length ? row.groupKeys : undefined;
  }

  private setSelectedAt(index: number, selected: boolean) {
    const row = this.getRowAt(index);
    if (!row || row.rowDisabled || row.selfLoaded === false) {
      return;
    }
    const treeSelectionState = this._treeSelectionState;
    if (treeSelectionState) {
      if (row.nodePath && this.isNodeSelectable(row)) {
        treeSelectionState.setNodeSelection(row.nodePath, selected);
      }
      return;
    }
    const rowSelectionState = this.rowSelectionState;
    const groupKeys = this.getGroupKeys(row);

    if (row.isGroupRow) {
      if (!groupKeys) {
        return;
      }
      if (selected) {
        rowSelectionState.selectGroupRow(groupKeys);
      } else {
        rowSelectionState.deselectGroupRow(groupKeys);
      }
      return;
    }

    if (selected) {
      rowSelectionState.selectRow(row.id, groupKeys);
    } else {
      rowSelectionState.deselectRow(row.id, groupKeys);
    }
  }

  isSelectedAt(index: number) {
    const row = this.getRowAt(index);
    if (!row) {
      return false;
    }
    if (this._treeSelectionState) {
      return row.nodePath
        ? this._treeSelectionState.isNodeSelected(row.nodePath)
        : false;
    }
    const groupKeys = this.getGroupKeys(row);
    if (row.isGroupRow) {
      return groupKeys
        ? this.rowSelectionState.isGroupRowSelected(groupKeys)
        : false;
    }
    return this.rowSelectionState.isRowSelected(row.id, groupKeys);
  }

  private setRangeSelected(
    startIndex: number,
    endIndex: number,
    selected: boolean,
  ) {
    const [start, end] = ensureMinMax(startIndex, endIndex);

    for (let i = start; i <= end; i++) {
      const row = this.getRowAt(i);
      if (!row) {
        continue;
      }
      if (i !== startIndex && this.isFollowedByItsChildren(i, row)) {
        // an expanded group row follows its children - only those in the range are selected
        continue;
      }
      this.setSelectedAt(i, selected);
    }
  }

  /**
   * Pivot group rows, lazy groups whose children are not loaded and parent nodes without children
   * are expanded without any children displayed - those are selected as a whole.
   */
  private isFollowedByItsChildren(index: number, row: MultiRowSelectorRow) {
    if (!this.isContainerRow(row) || !this.isExpanded(row)) {
      return false;
    }
    const path = this.getPath(row);
    const nextPath = this.getPath(this.getRowAt(index + 1));
    if (!path || !nextPath || nextPath.length < path.length) {
      return false;
    }
    return path.every((key, i) => key === nextPath[i]);
  }

  /**
   * This is the single click, without any modifier
   */
  resetClick(index: number) {
    this.deselectAll();
    this.setSelectedAt(index, true);

    this.multiSelectStartIndex = index;
    this.multiSelectEndIndex = undefined;
  }

  /**
   * This is the click with ctrl/cmd key pressed
   * @param index
   */
  singleAddClick(index: number) {
    if (this.isSelectedAt(index)) {
      this.setSelectedAt(index, false);
      if (this.isSelectedAt(index + 1)) {
        this.multiSelectStartIndex = index + 1;
      }
    } else {
      this.setSelectedAt(index, true);
      this.multiSelectStartIndex = index;

      let multiSelectEndIndex = undefined;

      // we have to go to previous rows and find the last row that we meet that is selected
      // without going over any deselected rows and that's the selection end
      for (let i = index - 1; i >= 0; i--) {
        if (this.isSelectedAt(i)) {
          multiSelectEndIndex = i;
        } else {
          break;
        }
      }
      this.multiSelectEndIndex = multiSelectEndIndex;
    }
  }

  /**
   * This is the click with shift key pressed - selects the range from the anchor
   * (the last click or cmd/ctrl+click) to the given index,
   * replacing the range selected by the previous shift+click from the same anchor.
   */
  multiSelectClick(index: number) {
    if (this.multiSelectEndIndex != null) {
      this.setRangeSelected(
        this.multiSelectStartIndex,
        this.multiSelectEndIndex,
        false,
      );
    }

    this.setRangeSelected(this.multiSelectStartIndex, index, true);

    this.multiSelectEndIndex = index;
  }
}
