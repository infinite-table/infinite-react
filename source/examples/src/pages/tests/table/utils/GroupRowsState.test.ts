import { GroupRowsState } from '@src/components/DataSource/GroupRowsState';

export default describe('GroupRowsState', () => {
  it('should work correctly with default collapsed true', () => {
    const a = {};
    const b = {};
    const state = new GroupRowsState({
      collapsedRows: true,
      expandedRows: [[3, 4, 5], [a, b], [b]],
    });

    expect(state.isGroupRowExpanded([b])).toEqual(true);
    expect(state.isGroupRowExpanded([{}])).toEqual(false);
    expect(state.isGroupRowExpanded([3, 4, 5])).toEqual(true);

    state.collapseAll();
    expect(state.isGroupRowExpanded([3, 4, 5])).toEqual(false);
    state.expandAll();
    expect(state.isGroupRowExpanded(['x'])).toEqual(true);

    expect(state.isGroupRowExpanded([a])).toEqual(true);
    state.collapseGroupRow([a]);
    expect(state.isGroupRowExpanded([a])).toEqual(false);
  });

  it('should work correctly with default expanded true', () => {
    const a = {};
    const b = {};
    const state = new GroupRowsState({
      collapsedRows: [[3, 4, 5], [a, b], [b]],
      expandedRows: true,
    });

    expect(state.isGroupRowCollapsed([b])).toEqual(true);
    expect(state.isGroupRowCollapsed([{}])).toEqual(false);
    expect(state.isGroupRowCollapsed([3, 4, 5])).toEqual(true);

    state.expandAll();
    expect(state.isGroupRowCollapsed([3, 4, 5])).toEqual(false);

    state.collapseAll();
    expect(state.isGroupRowCollapsed(['x'])).toEqual(true);

    expect(state.isGroupRowCollapsed([a])).toEqual(true);
    state.expandGroupRow([a]);
    expect(state.isGroupRowCollapsed([a])).toEqual(false);
    expect(state.isGroupRowExpanded([a])).toEqual(true);
  });

  it('should work when cloning', () => {
    const a = {};
    const b = {};
    const first = new GroupRowsState({
      collapsedRows: [[3, 4, 5], [a, b], [b]],
      expandedRows: true,
    });

    const second = new GroupRowsState(first);

    expect(second.isGroupRowCollapsed([3, 4, 5])).toBe(true);
    expect(second.isGroupRowCollapsed([3, 4])).toBe(false);
  });
});
