import { RowDetailState } from '@src/components/DataSource/RowDetailsState';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('RowDetailsState', () => {
  test('should work correctly with default collapsed true', () => {
    const state = new RowDetailState({
      collapsedRows: true,
      expandedRows: [1, 11],
    });

    expect(state.isRowDetailsExpanded(1)).toEqual(true);
    expect(state.isRowDetailsExpanded(11)).toEqual(true);

    expect(state.isRowDetailsExpanded(2)).toEqual(false);
  });

  test('should work correctly with default expanded true', () => {
    const state = new RowDetailState({
      collapsedRows: ['1', 2],
      expandedRows: true,
    });

    expect(state.isRowDetailsExpanded('1')).toEqual(false);
    expect(state.isRowDetailsExpanded(1)).toEqual(true);
    expect(state.isRowDetailsExpanded(2)).toEqual(false);
    expect(state.isRowDetailsExpanded(3)).toEqual(true);
  });
});
