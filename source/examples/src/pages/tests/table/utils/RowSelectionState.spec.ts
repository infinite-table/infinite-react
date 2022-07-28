import { RowSelectionState } from '@src/components/DataSource/RowSelectionState';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('RowSelectionState', () => {
  test('should work correctly with default deselectedRows true', () => {
    const state = new RowSelectionState({
      deselectedRows: true,
      selectedRows: {
        3: true,
        b: true,
      } as Record<string | number, true>,
    });

    expect(state.isRowSelected('b')).toEqual(true);
    expect(state.isRowSelected('c')).toEqual(false);
    expect(state.isRowSelected(3)).toEqual(true);

    state.deselectAll();
    expect(state.isRowSelected(3)).toEqual(false);
    state.selectAll();
    expect(state.isRowSelected(3)).toEqual(true);
    expect(state.isRowSelected(312)).toEqual(true);

    state.deselectRow(312);
    expect(state.isRowSelected(312)).toEqual(false);
  });

  test('should work correctly with default selected true', () => {
    const state = new RowSelectionState({
      deselectedRows: {
        3: true,
        b: true,
        515: true,
      } as Record<string, true>,
      selectedRows: true,
    });

    expect(state.isRowDeselected('b')).toEqual(true);
    expect(state.isRowDeselected('dsadasdas')).toEqual(false);
    expect(state.isRowDeselected('3')).toEqual(true);

    state.selectAll();
    expect(state.isRowDeselected('3')).toEqual(false);

    state.deselectAll();
    expect(state.isRowDeselected('x')).toEqual(true);

    expect(state.isRowDeselected('3')).toEqual(true);
    state.selectRow('3');
    expect(state.isRowDeselected('3')).toEqual(false);
  });

  test('should work when cloning', () => {
    const first = new RowSelectionState({
      deselectedRows: {
        3: true,
        b: true,
        515: true,
      } as Record<string, true>,
      selectedRows: true,
    });

    const second = new RowSelectionState(first);

    expect(second.isRowDeselected('b')).toBe(true);
    expect(second.isRowDeselected('c')).toBe(false);
  });
});
