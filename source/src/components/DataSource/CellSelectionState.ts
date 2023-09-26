import { DeepMap } from '../../utils/DeepMap';

export type CELL_SELECTION_DESCRIPTOR<
  ROW_PRIMARY_KEY_TYPE = any,
  COL_ID = string,
> = [ROW_PRIMARY_KEY_TYPE, COL_ID];

export type CellSelectionStateObject =
  | {
      selectedCells: CELL_SELECTION_DESCRIPTOR[];
      deselectedCells: CELL_SELECTION_DESCRIPTOR[];
      defaultSelection: boolean;
    }
  | {
      defaultSelection: true;
      deselectedCells: CELL_SELECTION_DESCRIPTOR[];
      selectedCells?: CELL_SELECTION_DESCRIPTOR[];
    }
  | {
      defaultSelection: false;
      selectedCells: CELL_SELECTION_DESCRIPTOR[];
      deselectedCells?: CELL_SELECTION_DESCRIPTOR[];
    };

const WILDCARD = '*';

export class CellSelectionState {
  wildcard: string = WILDCARD;

  cache: DeepMap<any, boolean> = new DeepMap();

  selectedCells: CELL_SELECTION_DESCRIPTOR[] | null = null;
  deselectedCells: CELL_SELECTION_DESCRIPTOR[] | null = null;

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

  update(stateObject: CellSelectionStateObject) {
    this.selectedCells = stateObject.selectedCells || null;
    this.deselectedCells = stateObject.deselectedCells || null;

    this.selectedRowsToColumns.clear();
    this.deselectedRowsToColumns.clear();
    this.cache.clear();

    if (this.selectedCells) {
      this.selectedCells.forEach((descriptor) => {
        const [rowId, colId] = descriptor;

        const selectedColsForRow =
          this.selectedRowsToColumns.get(rowId) || new Set();
        selectedColsForRow.add(colId);
        this.selectedRowsToColumns.set(rowId, selectedColsForRow);

        const selectedRowsForColumn =
          this.selectedColumnsToRows.get(colId) || new Set();
        selectedRowsForColumn.add(rowId);
        this.selectedColumnsToRows.set(colId, selectedRowsForColumn);
      });
    }

    if (this.deselectedCells) {
      this.deselectedCells.forEach((descriptor) => {
        const [rowId, colId] = descriptor;

        const deselectedColsForRow =
          this.deselectedRowsToColumns.get(rowId) || new Set();
        deselectedColsForRow.add(colId);
        this.deselectedRowsToColumns.set(rowId, deselectedColsForRow);

        const deselectedRowsForColumn =
          this.deselectedColumnsToRows.get(colId) || new Set();
        deselectedRowsForColumn.add(rowId);
        this.deselectedColumnsToRows.set(colId, deselectedRowsForColumn);
      });
    }
    this.defaultSelection = stateObject.defaultSelection;
  }

  public isCellSelected(rowId: any, colId: string): boolean {
    const cacheKey = [rowId, colId];
    const { cache } = this;
    const selected = cache.get(cacheKey);

    if (selected != null) {
      return selected;
    }
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
        cache.set(cacheKey, false);
        return false;
      }

      if (
        deselectedRowsForWildcardColumn?.has(rowId) ||
        deselectedColumnsForWildcardRow?.has(colId)
      ) {
        //it's deselected because of wildcard

        if (this.selectedRowsToColumns.get(rowId)?.has(colId)) {
          // but it's selected explicitly
          cache.set(cacheKey, true);
          return true;
        }

        // if not selected explicitly, then it's deselected

        cache.set(cacheKey, false);
        return false;
      }

      cache.set(cacheKey, true);
      return true;
    }

    const cols = this.selectedRowsToColumns.get(rowId);

    if (cols && cols.has(colId)) {
      cache.set(cacheKey, true);
      return true;
    }

    if (
      selectedRowsForWildcardColumn?.has(rowId) ||
      selectedColumnsForWildcardRow?.has(colId)
    ) {
      //it's selected because of wildcard

      if (this.deselectedRowsToColumns.get(rowId)?.has(colId)) {
        // but it's deselected explicitly
        cache.set(cacheKey, false);
        return false;
      }

      // if not deselected explicitly, then it's selected

      cache.set(cacheKey, true);
      return true;
    }

    cache.set(cacheKey, false);
    return false;
  }

  // private _getSelectedCellsForRow(rowId: any) {
  //   const isCellSelected = (columnId: string) => {
  //     return this.isCellSelected(rowId, columnId);
  //   };
  //   if (this.defaultSelection) {
  //     const set = this.deselectedRowsToColumns.get(rowId);

  //     return {
  //       isCellSelected,
  //       selectedCells: true,
  //       deselectedCells: set || (emptySet as Set<string>),
  //     };
  //   }
  //   return {
  //     isCellSelected,
  //     deselectedCells: true,
  //     selectedCells:
  //       this.selectedRowsToColumns.get(rowId) || (emptySet as Set<string>),
  //   };
  // }

  public getState(): CellSelectionStateObject {
    const deselectedCells: CELL_SELECTION_DESCRIPTOR[] = [];
    const selectedCells: CELL_SELECTION_DESCRIPTOR[] = [];

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
