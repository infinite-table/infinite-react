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
});
