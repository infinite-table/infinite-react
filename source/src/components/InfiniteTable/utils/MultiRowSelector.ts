import { RowSelectionState } from '../../DataSource/RowSelectionState';

export type MultiRowSelectorOptions = {
  getIdForIndex: (index: number) => string | number;
  isRowDisabledAt: (index: number) => boolean;
};

function ensureMinMax(start: number, end: number) {
  return start < end ? [start, end] : [end, start];
}

export class MultiRowSelector {
  getIdForIndex: MultiRowSelectorOptions['getIdForIndex'];
  isRowDisabledAt: MultiRowSelectorOptions['isRowDisabledAt'];

  multiSelectStartIndex: number = 0;
  multiSelectEndIndex?: number;

  _rowSelectionState!: RowSelectionState;

  constructor(options: MultiRowSelectorOptions) {
    this.getIdForIndex = options.getIdForIndex;
    this.isRowDisabledAt = options.isRowDisabledAt;
  }

  set rowSelectionState(rowSelectionState: RowSelectionState) {
    this._rowSelectionState = rowSelectionState;
  }

  get rowSelectionState() {
    return this._rowSelectionState;
  }

  private selectRange(startIndex: number, endIndex: number) {
    const [start, end] = ensureMinMax(startIndex, endIndex);

    const rowSelectionState = this.rowSelectionState;

    for (let i = start; i <= end; i++) {
      const id = this.getIdForIndex(i);
      if (this.isRowDisabledAt(i)) {
        continue;
      }
      rowSelectionState.selectRow(id);
    }
  }
  private deselectRange(startIndex: number, endIndex: number) {
    const [start, end] = ensureMinMax(startIndex, endIndex);

    const rowSelectionState = this.rowSelectionState;

    for (let i = start; i <= end; i++) {
      const id = this.getIdForIndex(i);

      if (this.isRowDisabledAt(i)) {
        continue;
      }

      rowSelectionState.deselectRow(id);
    }
  }

  /**
   * This is the single click, without any modifier
   */
  resetClick(index: number) {
    this.rowSelectionState.deselectAll();
    const id = this.getIdForIndex(index);

    this.rowSelectionState.selectRow(id);

    this.multiSelectStartIndex = index;
    this.multiSelectEndIndex = undefined;
  }

  /**
   * This is the click with ctrl/cmd key pressed
   * @param index
   */
  singleAddClick(index: number) {
    const id = this.getIdForIndex(index);

    if (this.rowSelectionState.isRowSelected(id)) {
      this.rowSelectionState.deselectRow(id);
      if (this.rowSelectionState.isRowSelected(this.getIdForIndex(index + 1))) {
        this.multiSelectStartIndex = index + 1;
      } else {
        // this.lastResetClickIndex = index;
      }
      // this.lastMultiAddClickIndex = undefined;
    } else {
      this.rowSelectionState.selectRow(id);
      this.multiSelectStartIndex = index;

      let multiSelectEndIndex = undefined;

      // we have to go to previous rows and find the last row that we meet that is selected
      // without going over any deselected rows and that's the selection end
      for (let i = index - 1; i >= 0; i--) {
        const id = this.getIdForIndex(i);
        if (this.rowSelectionState.isRowSelected(id)) {
          multiSelectEndIndex = i;
        } else {
          break;
        }
      }
      this.multiSelectEndIndex = multiSelectEndIndex;
    }
  }

  multiSelectClick(index: number) {
    if (this.multiSelectEndIndex != null) {
      this.deselectRange(this.multiSelectStartIndex, this.multiSelectEndIndex);
    }

    this.selectRange(this.multiSelectStartIndex, index);

    this.multiSelectEndIndex = index;
  }
}
