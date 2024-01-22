import { dbg } from '../../utils/debug';
import { DeepMap } from '../../utils/DeepMap';

const debug = dbg('CellSelectionState');

export type CellSelectionPosition<
  ROW_PRIMARY_KEY_TYPE = any,
  COL_ID = string,
> = [ROW_PRIMARY_KEY_TYPE, COL_ID];

export type CellSelectionStateObject =
  | {
      selectedCells: CellSelectionPosition[];
      deselectedCells: CellSelectionPosition[];
      defaultSelection: boolean;
    }
  | {
      defaultSelection: true;
      deselectedCells: CellSelectionPosition[];
      selectedCells?: CellSelectionPosition[];
    }
  | {
      defaultSelection: false;
      selectedCells: CellSelectionPosition[];
      deselectedCells?: CellSelectionPosition[];
    };

const WILDCARD = '*';

export class CellSelectionState {
  wildcard: string = WILDCARD;

  cache: DeepMap<any, boolean> = new DeepMap();

  selectedRowsToColumns: Map<any, Set<string>> = new Map();
  selectedColumnsToRows: Map<string, Set<any>> = new Map();
  deselectedRowsToColumns: Map<any, Set<string>> = new Map();
  deselectedColumnsToRows: Map<string, Set<any>> = new Map();

  defaultSelection: boolean = false;

  constructor(clone?: CellSelectionStateObject | CellSelectionState) {
    const stateObject =
      clone && clone instanceof Object.getPrototypeOf(this).constructor
        ? (clone as CellSelectionState).getState()
        : (clone as CellSelectionStateObject | undefined);

    if (stateObject) {
      this.update(stateObject);
    }
  }

  deselectAll = () => {
    this.update({
      defaultSelection: false,
      selectedCells: [],
    });
  };

  selectAll = () => {
    this.update({
      defaultSelection: true,
      deselectedCells: [],
    });
  };

  public selectCell(rowId: any, colId: string) {
    this.setCellSelected(rowId, colId, true);
  }
  public deselectCell(rowId: any, colId: string) {
    this.setCellSelected(rowId, colId, false);
  }

  public selectColumn(colId: string) {
    this.setCellSelected(this.wildcard, colId, true);
  }
  public deselectColumn(colId: string) {
    this.setCellSelected(this.wildcard, colId, false);
  }

  public setCellSelected(rowId: any, colId: string, selected: boolean) {
    const wildcardRow = rowId === this.wildcard;
    const wildcardColumn = colId === this.wildcard;

    const isSelected = this.isCellSelected_Internal(rowId, colId);

    if (isSelected === selected) {
      return;
    }

    const clearKeys: [any, string][] = [];
    if (wildcardRow) {
      const deselectedRowsForColumn = this.deselectedColumnsToRows.get(colId);
      const selectedRowsForColumn = this.selectedColumnsToRows.get(colId);

      deselectedRowsForColumn?.forEach((rowId) => {
        if (rowId === this.wildcard) {
          return;
        }

        this.setCellInDeselection(rowId, colId, false);
      });

      // remove all rows for the specific column
      // from the selection
      // as we'll apply a wildcard selection
      selectedRowsForColumn?.forEach((rowId) => {
        if (rowId === this.wildcard) {
          return;
        }

        this.setCellInSelection(rowId, colId, false);
      });

      [...this.cache.keys()].forEach((key) => {
        const [rowId, c] = key as [any, string];

        if (c === colId) {
          clearKeys.push([rowId, colId]);
        }
      });
    }

    if (wildcardColumn) {
      const deselectedColumnsForRow = this.deselectedRowsToColumns.get(colId);
      const selectedColumnsForRow = this.selectedRowsToColumns.get(colId);

      deselectedColumnsForRow?.forEach((colId) => {
        if (colId === this.wildcard) {
          return;
        }

        this.setCellInDeselection(rowId, colId, false);
      });

      // remove all rows for the specific column
      // from the selection
      // as we'll apply a wildcard selection
      selectedColumnsForRow?.forEach((colId) => {
        if (colId === this.wildcard) {
          return;
        }

        this.setCellInSelection(rowId, colId, false);
      });

      [...this.cache.keys()].forEach((key) => {
        const [row] = key as [any, string];

        if (row === rowId) {
          clearKeys.push([rowId, colId]);
        }
      });
    }

    const cacheKey = [rowId, colId];

    clearKeys.forEach((key) => {
      this.cache.delete(key);
    });
    this.cache.delete(cacheKey);

    if (selected) {
      // make the cell selected

      if (this.defaultSelection) {
        // default selection is true
        // the cell is deselected
        // either specifically via rowid/colid
        // or via wildcard
        const cellsForThisRow = this.deselectedRowsToColumns.get(rowId);

        if (cellsForThisRow && cellsForThisRow.has(colId)) {
          // the cell is specifically mentioned in the deselection
          // so we want to remove it from the deselection
          // in order to make it selected
          this.setCellInDeselection(rowId, colId, false);
          // we're intentionally not returning here
          // to also allow the check for wildcard deselection
        }

        // check if the cell is deselected via wildcard
        const deselectedColumnsForWildcardRow =
          this.deselectedRowsToColumns.get(this.wildcard);

        const deselectedRowsForWildcardColumn =
          this.deselectedColumnsToRows.get(this.wildcard);

        if (
          deselectedColumnsForWildcardRow?.has(colId) ||
          deselectedRowsForWildcardColumn?.has(rowId)
        ) {
          // the cell is deselected via wildcard

          // so we need to add it to selection explicitly
          this.setCellInSelection(rowId, colId, true);
        }
      } else {
        // default selection is false

        // currently the cell is deselected
        // either explicitly via rowid/colid or via wildcard
        // or simply due to default selection being false
        const cellsForThisRow = this.deselectedRowsToColumns.get(rowId);

        if (cellsForThisRow && cellsForThisRow.has(colId)) {
          // the cell is specifically mentioned in the deselection
          // so we want to remove it from the deselection
          // in order to make it selected

          this.setCellInDeselection(rowId, colId, false);
          // we're intentionally not returning here
        }
        // the cell is deselected either due to wildcard deselection
        // or due to the default selection being false
        // so we need to add it to selection explicitly
        this.setCellInSelection(rowId, colId, true);
      }
    } else {
      // make the cell deselected

      if (this.defaultSelection) {
        // by default cells are selected
        // and we need to make this cell deselected

        const cellsForThisRow = this.selectedRowsToColumns.get(rowId);

        if (cellsForThisRow?.has(colId)) {
          // the cell is specifically mentioned in the selection
          // so we want to remove it from the selection
          // and specifically add it to deselection

          this.setCellInSelection(rowId, colId, false);
          // we're intentionally not returning here
        }

        // the cell is selected due to the default selection being true
        // or due to wildcard selection
        // so we need to add it to deselection explicitly
        this.setCellInDeselection(rowId, colId, true);
      } else {
        // by default cells are deselected
        // and we need to make this cell deselected as well

        const cellsForThisRow = this.selectedRowsToColumns.get(rowId);

        if (cellsForThisRow?.has(colId)) {
          // the cell is specifically mentioned in the selection
          // so we want to remove it from the selection

          this.setCellInSelection(rowId, colId, false);
        }

        // check if the cell is selected via wildcard
        const selectedColumnsForWildcardRow = this.selectedRowsToColumns.get(
          this.wildcard,
        );

        const selectedRowsForWildcardColumn = this.selectedColumnsToRows.get(
          this.wildcard,
        );

        if (
          selectedColumnsForWildcardRow?.has(colId) ||
          selectedRowsForWildcardColumn?.has(rowId)
        ) {
          // the cell is selected via wildcard

          // so we need to add it to deselection explicitly
          this.setCellInDeselection(rowId, colId, true);
          return;
        }
      }
    }
  }

  private setCellInDeselection(rowId: any, colId: string, selected: boolean) {
    // manage the rows to columns map for deselection
    if (selected) {
      const deselectedColsForRow =
        this.deselectedRowsToColumns.get(rowId) || new Set();

      deselectedColsForRow.add(colId);
      this.deselectedRowsToColumns.set(rowId, deselectedColsForRow);
    } else {
      const deselectedColsForRow = this.deselectedRowsToColumns.get(rowId);
      if (deselectedColsForRow) {
        deselectedColsForRow.delete(colId);

        if (deselectedColsForRow.size === 0) {
          this.deselectedRowsToColumns.delete(rowId);
        }
      }
    }

    // manage the columns to rows map for deselection

    if (selected) {
      const deselectedRowsForColumn =
        this.deselectedColumnsToRows.get(colId) || new Set();
      deselectedRowsForColumn.add(rowId);
      this.deselectedColumnsToRows.set(colId, deselectedRowsForColumn);
    } else {
      const deselectedRowsForColumn = this.deselectedColumnsToRows.get(colId);
      if (deselectedRowsForColumn) {
        deselectedRowsForColumn.delete(rowId);
        if (deselectedRowsForColumn.size === 0) {
          this.deselectedColumnsToRows.delete(colId);
        }
      }
    }
  }

  private setCellInSelection(rowId: any, colId: string, selected: boolean) {
    if (rowId === this.wildcard && colId === this.wildcard) {
      throw new Error(
        'rowId and colId cannot be used as a wildcard at the same time!',
      );
    }
    // manage the rows to columns map for selection
    if (selected) {
      const selectedColsForRow =
        this.selectedRowsToColumns.get(rowId) || new Set();
      selectedColsForRow.add(colId);
      this.selectedRowsToColumns.set(rowId, selectedColsForRow);
    } else {
      const selectedColsForRow = this.selectedRowsToColumns.get(rowId);
      if (selectedColsForRow) {
        selectedColsForRow.delete(colId);

        if (selectedColsForRow.size === 0) {
          this.selectedRowsToColumns.delete(rowId);
        }
      }
    }

    // manage the columns to rows map for selection
    if (selected) {
      const selectedRowsForColumn =
        this.selectedColumnsToRows.get(colId) || new Set();
      selectedRowsForColumn.add(rowId);
      this.selectedColumnsToRows.set(colId, selectedRowsForColumn);
    } else {
      const selectedRowsForColumn = this.selectedColumnsToRows.get(colId);
      if (selectedRowsForColumn) {
        selectedRowsForColumn.delete(rowId);
        if (selectedRowsForColumn.size === 0) {
          this.selectedColumnsToRows.delete(colId);
        }
      }
    }
  }

  update(stateObject: CellSelectionStateObject) {
    const selectedCells = stateObject.selectedCells || null;
    const deselectedCells = stateObject.deselectedCells || null;

    this.selectedRowsToColumns.clear();
    this.selectedColumnsToRows.clear();
    this.deselectedRowsToColumns.clear();
    this.deselectedColumnsToRows.clear();
    this.cache.clear();

    if (selectedCells) {
      selectedCells.forEach(([rowId, colId]) => {
        this.setCellInSelection(rowId, colId, true);
      });
    }

    if (deselectedCells) {
      deselectedCells.forEach(([rowId, colId]) => {
        this.setCellInDeselection(rowId, colId, true);
      });
    }
    this.defaultSelection = stateObject.defaultSelection;
  }

  /**
   * Returns whether there is at least one selected cell in the row
   *
   * @param rowId the row id
   * @param columnIds the columns currently available in the grid
   * @returns boolean
   */
  public isCellSelectionInRow(rowId: any, columnIds: string[]): boolean {
    if (this.defaultSelection) {
      const cols = this.deselectedRowsToColumns.get(rowId);

      if (cols) {
        if (cols.has(this.wildcard)) {
          // all the columns in this row are deselected
          // so we need to check if there's one explicitly selected
          const explicitlySelectedCols = this.selectedRowsToColumns.get(rowId);

          return explicitlySelectedCols && explicitlySelectedCols.size > 0
            ? columnIds.some((colId) => explicitlySelectedCols.has(colId))
            : false;
        }

        // if not all columns are marked as deselected
        // we can return true
        return columnIds.some((colId) => !cols.has(colId));
      }
      return true;
    }

    // by default the cells are deselected

    // so check the selected cols for this row
    const cols = this.selectedRowsToColumns.get(rowId);
    if (cols) {
      if (cols.has(this.wildcard)) {
        // all the columns in this row are selected via wildcard
        // so we need to check if they are not all explicitly deselected
        const explicitlyDeselectedCols =
          this.deselectedRowsToColumns.get(rowId);

        if (explicitlyDeselectedCols && explicitlyDeselectedCols.size > 0) {
          const allDeselected = columnIds.every((colId) =>
            explicitlyDeselectedCols.has(colId),
          );
          return !allDeselected;
        }
        return true;
      }

      // if at least one column is selected
      // we can return true
      return columnIds ? columnIds.some((colId) => cols.has(colId)) : false;
    }
    return false;
  }

  public isCellSelected(rowId: any, colId: string): boolean {
    if (rowId === this.wildcard || colId === this.wildcard) {
      console.error(
        `CellSelectionState.isCellSelected should not be called with wildcard`,
      );
      debug(
        `CellSelectionState.isCellSelected should not be called with wildcard`,
      );
      return false;
    }

    return this.isCellSelected_Internal(rowId, colId);
  }
  private isCellSelected_Internal(rowId: any, colId: string): boolean {
    const cacheKey = [rowId, colId];
    const { cache } = this;
    const selected = cache.get(cacheKey);

    if (selected != null) {
      return selected;
    }

    const returnFalse = () => {
      cache.set(cacheKey, false);
      return false;
    };
    const returnTrue = () => {
      cache.set(cacheKey, true);
      return true;
    };

    const deselectedRowsForWildcardColumn = this.deselectedColumnsToRows.get(
      this.wildcard,
    );
    const deselectedColumnsForWildcardRow = this.deselectedRowsToColumns.get(
      this.wildcard,
    );

    const selectedRowsForWildcardColumn = this.selectedColumnsToRows.get(
      this.wildcard,
    );
    const selectedColumnsForWildcardRow = this.selectedRowsToColumns.get(
      this.wildcard,
    );

    let defaultSelection = this.defaultSelection;

    if (defaultSelection) {
      const cols = this.deselectedRowsToColumns.get(rowId);

      if (cols && cols.has(colId)) {
        return returnFalse();
      }

      if (
        deselectedRowsForWildcardColumn?.has(rowId) ||
        deselectedColumnsForWildcardRow?.has(colId)
      ) {
        //it's deselected because of wildcard

        if (this.selectedRowsToColumns.get(rowId)?.has(colId)) {
          // but it's selected explicitly
          return returnTrue();
        }

        // if not selected explicitly, then it's deselected

        return returnFalse();
      }

      return returnTrue();
    }

    const cols = this.selectedRowsToColumns.get(rowId);

    if (cols && cols.has(colId)) {
      return returnTrue();
    }

    if (
      selectedRowsForWildcardColumn?.has(rowId) ||
      selectedColumnsForWildcardRow?.has(colId)
    ) {
      //it's selected because of wildcard

      if (this.deselectedRowsToColumns.get(rowId)?.has(colId)) {
        // but it's deselected explicitly
        return returnFalse();
      }

      // if not deselected explicitly, then it's selected
      return returnTrue();
    }

    return returnFalse();
  }

  public getState(): CellSelectionStateObject {
    const deselectedCells: CellSelectionPosition[] = [];
    const selectedCells: CellSelectionPosition[] = [];

    this.deselectedRowsToColumns.forEach((cols, rowId) => {
      cols.forEach((colId) => {
        deselectedCells.push([rowId, colId]);
      });
    });

    this.selectedRowsToColumns.forEach((cols, rowId) => {
      cols.forEach((colId) => {
        selectedCells.push([rowId, colId]);
      });
    });

    return {
      defaultSelection: this.defaultSelection,
      deselectedCells,
      selectedCells,
    };
  }
}
