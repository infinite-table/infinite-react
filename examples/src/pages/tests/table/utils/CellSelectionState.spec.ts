import { test, expect } from '@playwright/test';
import { CellSelectionState } from '@src/components/DataSource/CellSelectionState';

export default test.describe.parallel('CellSelectionState', () => {
  test('should work when defaultSelection is false', () => {
    const state = new CellSelectionState({
      defaultSelection: false,
      selectedCells: [
        ['1', 'name'],
        ['*', 'age'],
        ['5', '*'],
      ],
      deselectedCells: [
        ['10', 'age'],
        ['5', 'x'],
      ],
    });

    expect(state.isCellSelected('1', 'name')).toEqual(true);
    expect(state.isCellSelected('1', 'namexxx')).toEqual(false);
    expect(state.isCellSelected('1', 'age')).toEqual(true);
    expect(state.isCellSelected('2', 'age')).toEqual(true);
    expect(state.isCellSelected('3', 'age')).toEqual(true);
    expect(state.isCellSelected('5', 'agexxx')).toEqual(true);
    expect(state.isCellSelected('6', 'agexxx')).toEqual(false);
    expect(state.isCellSelected('6', 'age')).toEqual(true);
    expect(state.isCellSelected('10', 'age')).toEqual(false);
    expect(state.isCellSelected('5', 'x')).toEqual(false);
  });

  test('should work when defaultSelection is true', () => {
    const state = new CellSelectionState({
      defaultSelection: true,
      deselectedCells: [
        ['1', 'name'],
        ['*', 'age'],
        ['5', '*'],
      ],
      selectedCells: [['10', 'age']],
    });

    expect(state.isCellSelected('1', 'name')).toEqual(false);
    expect(state.isCellSelected('1', 'namex')).toEqual(true);

    expect(state.isCellSelected('1', 'age')).toEqual(false);
    expect(state.isCellSelected('2', 'age')).toEqual(false);
    expect(state.isCellSelected('3', 'age')).toEqual(false);
    expect(state.isCellSelected('5', 'agexxx')).toEqual(false);
    expect(state.isCellSelected('6', 'agexxx')).toEqual(true);
    expect(state.isCellSelected('6', 'age')).toEqual(false);
    expect(state.isCellSelected('10', 'age')).toEqual(true);
  });

  test('.selectCell should work with defaultSelection:true', () => {
    const state = new CellSelectionState({
      defaultSelection: true,
      selectedCells: [[2, 'c2']],
      deselectedCells: [
        [1, 'c1'],
        [1, 'c2'],
        [2, '*'],
      ],
    });

    expect(state.isCellSelected(1, 'c1')).toBe(false);
    expect(state.isCellSelected(1, 'c3')).toBe(true);
    expect(state.isCellSelected(2, 'c1')).toBe(false);
    expect(state.isCellSelected(2, 'c2')).toBe(true);
    expect(state.isCellSelected(2, 'c3')).toBe(false);

    state.selectCell(1, 'c1');
    expect(state.isCellSelected(1, 'c1')).toBe(true);

    state.selectCell(2, 'c1');
    expect(state.isCellSelected(2, 'c1')).toBe(true);
    expect(state.isCellSelected(2, 'c3')).toBe(false);
  });

  test('.selectCell should work with defaultSelection:false', () => {
    const state = new CellSelectionState({
      defaultSelection: false,
      selectedCells: [[2, 'c2']],
      deselectedCells: [['*', 'c3']],
    });

    expect(state.isCellSelected(1, 'c1')).toBe(false);
    expect(state.isCellSelected(2, 'c2')).toBe(true);
    expect(state.isCellSelected(2, 'c3')).toBe(false);

    state.selectCell(1, 'c1');
    expect(state.isCellSelected(1, 'c1')).toBe(true);

    state.selectCell(2, 'c3');
    expect(state.isCellSelected(2, 'c3')).toBe(true);

    state.selectCell(1, 'c3');
    expect(state.isCellSelected(1, 'c3')).toBe(true);
    state.deselectCell(1, 'c3');
    expect(state.isCellSelected(1, 'c3')).toBe(false);
  });

  test('.deselectCell should work with defaultSelection:true', () => {
    const state = new CellSelectionState({
      defaultSelection: true,
      deselectedCells: [[2, 'c2']],
      selectedCells: [
        [1, 'c1'],
        [1, 'c2'],
        [2, '*'],
      ],
    });

    expect(state.isCellSelected(1, 'c1')).toBe(true);

    state.deselectCell(1, 'c1');
    expect(state.isCellSelected(1, 'c1')).toBe(false);

    expect(state.isCellSelected(2, 'c1')).toBe(true);
    state.deselectCell(2, 'c1');
    expect(state.isCellSelected(2, 'c1')).toBe(false);
  });

  test('.deselectCell should work with defaultSelection:false', () => {
    const state = new CellSelectionState({
      defaultSelection: false,
      deselectedCells: [[2, 'c2']],
      selectedCells: [['*', 'c3']],
    });

    expect(state.isCellSelected(1, 'c1')).toBe(false);
    expect(state.isCellSelected(1, 'c3')).toBe(true);

    state.deselectCell(1, 'c3');

    expect(state.isCellSelected(1, 'c3')).toBe(false);
    expect(state.isCellSelected(2, 'c3')).toBe(true);
  });

  test('column selection should work with default selection true', () => {
    const state = new CellSelectionState({
      defaultSelection: true,
      deselectedCells: [[2, 'c2']],
      selectedCells: [],
    });

    expect(state.isCellSelected(1, 'c2')).toBe(true);
    state.deselectColumn('c2');
    expect(state.isCellSelected(1, 'c2')).toBe(false);
    expect(state.isCellSelected(2, 'c2')).toBe(false);
    expect(state.isCellSelected(3, 'c2')).toBe(false);

    state.selectColumn('c2');
    expect(state.isCellSelected(1, 'c2')).toBe(true);
    expect(state.isCellSelected(2, 'c2')).toBe(true);
    expect(state.isCellSelected(3, 'c2')).toBe(true);
    expect(state.isCellSelected(4, 'c2')).toBe(true);
    expect(state.isCellSelected(5, 'c2')).toBe(true);
  });

  test('column selection should work with default selection false', () => {
    const state = new CellSelectionState({
      defaultSelection: false,
      deselectedCells: [[2, 'c2']],
      selectedCells: [],
    });

    expect(state.isCellSelected(1, 'c2')).toBe(false);
    expect(state.isCellSelected(2, 'c2')).toBe(false);
    state.deselectColumn('c2');
    expect(state.isCellSelected(1, 'c2')).toBe(false);
    expect(state.isCellSelected(1, 'c2')).toBe(false);

    expect(state.isCellSelected(3, 'c2')).toBe(false);

    state.selectColumn('c2');
    expect(state.isCellSelected(1, 'c2')).toBe(true);
    expect(state.isCellSelected(2, 'c2')).toBe(true);
    expect(state.isCellSelected(3, 'c2')).toBe(true);

    expect(state.isCellSelected(4, 'c2')).toBe(true);
    expect(state.isCellSelected(5, 'c2')).toBe(true);
  });

  test('wildcards edge case with defaultSelection:true', () => {
    const state = new CellSelectionState({
      defaultSelection: true,
      deselectedCells: [['*', 'c2']],
      selectedCells: [['x', '*']],
    });

    try {
      new CellSelectionState({
        defaultSelection: true,
        deselectedCells: [['*', 'c2']],
        selectedCells: [['*', '*']],
      });
    } catch (ex) {
      //@ts-ignore
      expect(ex.message).toBe(
        'rowId and colId cannot be used as a wildcard at the same time!',
      );
    }

    expect(state.isCellSelected(1, 'c2')).toBe(false);
    expect(state.isCellSelected(1, 'c3')).toBe(true);
  });

  test('wildcards edge case with defaultSelection:false', () => {
    const state = new CellSelectionState({
      defaultSelection: false,
      deselectedCells: [['*', 'c2']],
      selectedCells: [[3, '*']],
    });

    expect(state.isCellSelected(1, 'c2')).toBe(false);
    expect(state.isCellSelected(2, 'c4')).toBe(false);
    expect(state.isCellSelected(3, 'c4')).toBe(true);
  });

  test('defaultSelection: true - isCellSelectionInRow should work fine - case 1', () => {
    const state = new CellSelectionState({
      defaultSelection: true,
      deselectedCells: [
        [0, 'firstName'],
        [1, 'firstName'],
        [1, 'age'],
        [1, 'lastName'],
        [5, 'lastName'],
        [3, '*'],
        [7, '*'],
        [7, 'age'],
      ],
      selectedCells: [[3, 'age']],
    });

    const cols = ['firstName', 'lastName', 'age'];
    expect(state.isCellSelectionInRow(0, cols)).toBe(true);
    expect(state.isCellSelectionInRow(1, cols)).toBe(false);
    expect(state.isCellSelectionInRow(7, cols)).toBe(false);
    expect(state.isCellSelectionInRow(3, cols)).toBe(true);
    expect(state.isCellSelectionInRow(5111, cols)).toBe(true);
  });

  test('defaultSelection: true - isCellSelectionInRow should work fine - case 2', () => {
    const state = new CellSelectionState({
      defaultSelection: true,
      selectedCells: [
        [0, 'firstName'],
        [1, 'firstName'],
        [1, 'age'],
        [1, 'lastName'],
        [5, 'lastName'],
        [3, 'age'],
        [7, '*'],
        [7, 'age'],
      ],
      deselectedCells: [
        [3, '*'],
        [13, '*'],
      ],
    });

    const cols = ['firstName', 'lastName', 'age'];
    expect(state.isCellSelectionInRow(0, cols)).toBe(true);
    expect(state.isCellSelectionInRow(1, cols)).toBe(true);
    expect(state.isCellSelectionInRow(7, cols)).toBe(true);
    expect(state.isCellSelectionInRow(3, cols)).toBe(true);
    expect(state.isCellSelectionInRow(5111, cols)).toBe(true);
    expect(state.isCellSelectionInRow(13, cols)).toBe(false);
  });

  test('defaultSelection: false - isCellSelectionInRow should work fine - case 1', () => {
    const state = new CellSelectionState({
      defaultSelection: false,
      deselectedCells: [
        [0, 'firstName'],
        [1, 'firstName'],
        [1, 'age'],
        [1, 'lastName'],
        [5, 'lastName'],
        [3, '*'],
        [7, '*'],
        [7, 'age'],
        [8, 'age'],
        [8, 'firstName'],
      ],
      selectedCells: [
        [3, 'age'],
        [8, '*'],
        [13, '*'],
      ],
    });

    const cols = ['firstName', 'lastName', 'age'];
    expect(state.isCellSelectionInRow(0, cols)).toBe(false);
    expect(state.isCellSelectionInRow(1, cols)).toBe(false);
    expect(state.isCellSelectionInRow(7, cols)).toBe(false);
    expect(state.isCellSelectionInRow(3, cols)).toBe(true);
    expect(state.isCellSelectionInRow(5111, cols)).toBe(false);
    expect(state.isCellSelectionInRow(13, cols)).toBe(true);
    expect(state.isCellSelectionInRow(8, cols)).toBe(true);
    expect(state.isCellSelectionInRow(8, ['age', 'firstName'])).toBe(false);
  });

  test('defaultSelection: false - isCellSelectionInRow should work fine - case 2', () => {
    const state = new CellSelectionState({
      defaultSelection: false,
      selectedCells: [
        [0, 'firstName'],
        [1, 'firstName'],
        [1, 'age'],
        [1, 'lastName'],
        [5, 'lastName'],
        [3, '*'],
        [7, '*'],
      ],
      deselectedCells: [
        [3, 'age'],
        [13, '*'],
        [7, 'age'],
        [7, 'firstName'],
        [7, 'lastName'],
      ],
    });

    const cols = ['firstName', 'lastName', 'age'];
    expect(state.isCellSelectionInRow(0, cols)).toBe(true);
    expect(state.isCellSelectionInRow(1, cols)).toBe(true);
    expect(state.isCellSelectionInRow(3, cols)).toBe(true);
    expect(state.isCellSelectionInRow(5111, cols)).toBe(false);
    expect(state.isCellSelectionInRow(7, cols)).toBe(false);
    expect(state.isCellSelectionInRow(7, cols)).toBe(false);
    expect(state.isCellSelectionInRow(7, [...cols, 'x'])).toBe(true);
  });
});
