import { test, expect } from '@playwright/test';
import {
  GridCellManager,
  GridCellInterface,
} from '@src/components/HeadlessTable/GridCellManager';

const createCell = (node?: string): GridCellInterface<any> => {
  node = node || '';
  return {
    update: (newNode: string) => {
      node = newNode;
    },
    getElement: () => null,
    getNode: () => node,
    destroy: () => {},
    onMount: () => {},
    debugId: 'test',
    ref: () => {},
    getAdditionalInfo: () => node,
    isMounted: () => true,
  };
};
export default test.describe('GridCellManager', () => {
  test('GridCellManager.discardRowsStartingWith', async () => {
    const manager = new GridCellManager('test');

    manager.renderNodeAtCell('a', createCell(), [0, 0]);
    manager.renderNodeAtCell('b', createCell(), [0, 1]);
    manager.renderNodeAtCell('c', createCell(), [1, 0]);
    manager.renderNodeAtCell('d', createCell(), [1, 1]);
    manager.renderNodeAtCell('d', createCell(), [3, 1]);
    manager.renderNodeAtCell('e', createCell(), [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', 'd', null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.detachRowsStartingWith(2);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  test('GridCellManager.getColumnsWithCells', async () => {
    const manager = new GridCellManager('test');

    manager.renderNodeAtCell('a', createCell(), [0, 0]);
    // manager.renderNodeAtCell('b', createCell(), [0, 1]);
    manager.renderNodeAtCell('c', createCell(), [1, 0]);
    // manager.renderNodeAtCell('d', createCell(), [1, 1]);
    // manager.renderNodeAtCell('d', createCell(), [3, 1]);
    manager.renderNodeAtCell('e', createCell(), [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', null, null],
      ['c', null, null],
      [null, null, null],
      [null, null, 'e'],
    ]);

    expect(manager.getColumnsWithCells()).toEqual([0, 2]);
    expect(manager.isColumnAttached(0)).toBe(true);
    expect(manager.isColumnAttached(1)).toBe(false);
    expect(manager.isColumnAttached(2)).toBe(true);

    expect(manager.isRowAttached(0)).toBe(true);
    expect(manager.isRowAttached(1)).toBe(true);
    expect(manager.isRowAttached(2)).toBe(false);
    expect(manager.isRowAttached(3)).toBe(true);
  });

  test('GridCellManager.getCellFor', async () => {
    const manager = new GridCellManager('test');

    const a = createCell('a');
    const b = createCell('b');
    const c = createCell('c');
    const d = createCell('d');
    const e = createCell('e');

    manager.renderNodeAtCell('a', a, [0, 0]);
    manager.renderNodeAtCell('b', b, [0, 1]);
    manager.renderNodeAtCell('c', c, [1, 0]);
    manager.renderNodeAtCell('d', d, [1, 1]);
    manager.renderNodeAtCell('d', d, [3, 1]);
    manager.renderNodeAtCell('e', e, [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.detachCell(a);

    expect(manager.getMatrix()).toEqual([
      [null, 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    // expect the manager to give me cell a, as it was previouly
    // rendered at [0, 0], so it was on the same row

    expect(manager.getCellFor([0, 2], 'row')).toBe(a);

    manager.renderNodeAtCell('a', a, [0, 2]);

    const newNode = manager.getCellFor([0, 0], 'row')?.getNode();
    expect((newNode as any).__pw_type).toBe('jsx');
  });

  test('GridCellManager.getCellFor - second test', async () => {
    const manager = new GridCellManager('test');

    const a = createCell('a');
    const b = createCell('b');
    const c = createCell('c');
    const d = createCell('d');
    const e = createCell('e');

    manager.renderNodeAtCell('a', a, [0, 0]);
    manager.renderNodeAtCell('b', b, [0, 1]);
    manager.renderNodeAtCell('c', c, [1, 0]);
    manager.renderNodeAtCell('d', d, [1, 1]);
    manager.renderNodeAtCell('d', d, [3, 1]);
    manager.renderNodeAtCell('e', e, [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.detachCell(a);

    manager.renderNodeAtCell('a', a, [1, 1]);
    manager.renderNodeAtCell('b', b, [2, 0]);

    expect(manager.getMatrix()).toEqual([
      [null, null, null],
      ['c', 'a', null],
      ['b', null, null],
      [null, 'd', 'e'],
    ]);
  });

  test('getColumnsWithCells', async () => {
    const manager = new GridCellManager('test');

    const a = createCell('a');
    const b = createCell('b');

    manager.renderNodeAtCell('a', a, [1, 2]);
    manager.renderNodeAtCell('b', b, [1, 0]);

    expect(manager.getColumnsWithCells()).toEqual([0, 2]);
  });

  test('GridCellManager.renderNodeAtCell, for a detached cell, at same position', async () => {
    const manager = new GridCellManager('test');

    const a = createCell('a');
    const b = createCell('b');
    const c = createCell('c');
    const d = createCell('d');
    const e = createCell('e');

    manager.renderNodeAtCell('a', a, [0, 0]);
    manager.renderNodeAtCell('b', b, [0, 1]);
    manager.renderNodeAtCell('c', c, [1, 0]);
    manager.renderNodeAtCell('d', d, [1, 1]);
    manager.renderNodeAtCell('d', d, [3, 1]);
    manager.renderNodeAtCell('e', e, [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.detachCell(b);

    expect(manager.getMatrix()).toEqual([
      ['a', null, null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.renderNodeAtCell('b', b, [0, 1]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);
  });

  test('GridCellManager render an attached cell to another position', async () => {
    const manager = new GridCellManager('test');

    const a = createCell('a');
    const b = createCell('b');
    const c = createCell('c');
    const d = createCell('d');
    const e = createCell('e');

    manager.renderNodeAtCell('a', a, [0, 0]);
    manager.renderNodeAtCell('b', b, [0, 1]);
    manager.renderNodeAtCell('c', c, [1, 0]);
    manager.renderNodeAtCell('d', d, [1, 1]);
    manager.renderNodeAtCell('d', d, [3, 1]);
    manager.renderNodeAtCell('e', e, [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.renderNodeAtCell('a', a, [0, 2]);

    expect(manager.getMatrix()).toEqual([
      [null, 'b', 'a'],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    // expect it to give me a new node for 0,0 as a is already attached at 0,2
    expect(
      (manager.getCellFor([0, 0], 'row')?.getNode() as any).__pw_type,
    ).toBe('jsx');
  });

  test('GridCellManager.getCellFor - third test', async () => {
    const manager = new GridCellManager('test');

    const a = createCell('a');
    const b = createCell('b');
    const c = createCell('c');
    const d = createCell('d');
    const e = createCell('e');

    manager.renderNodeAtCell('a', a, [0, 0]);
    manager.renderNodeAtCell('b', b, [0, 1]);
    manager.renderNodeAtCell('c', c, [1, 0]);
    manager.renderNodeAtCell('d', d, [1, 1]);
    manager.renderNodeAtCell('d', d, [3, 1]);
    manager.renderNodeAtCell('e', e, [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.renderNodeAtCell('a', a, [3, 2]);
    expect(manager.getMatrix()).toEqual([
      [null, 'b', null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'a'],
    ]);
    manager.renderNodeAtCell('b', b, [2, 0]);

    expect(manager.getMatrix()).toEqual([
      [null, null, null],
      ['c', null, null],
      ['b', null, null],
      [null, 'd', 'a'],
    ]);

    expect(manager.getCellFor([2, 2], 'column')).toBe(e);
    expect(manager.getCellFor([3, 0], 'row')).toBe(e);

    manager.detachCell(d);

    expect(manager.getCellFor([2, 1], 'column')).toBe(d);

    manager.renderNodeAtCell('d', d, [2, 1]);
    manager.detachCellAt([2, 1]);

    expect(manager.getCellFor([2, 2], 'row')).toBe(d);
  });
  test('GridCellManager.getCellFor - check correct return after multiple detaches', async () => {
    const manager = new GridCellManager('test');

    const a = createCell('a');
    const b = createCell('b');
    const c = createCell('c');
    const d = createCell('d');
    const e = createCell('e');
    const f = createCell('f');

    manager.renderNodeAtCell('a', a, [0, 0]);
    manager.renderNodeAtCell('b', b, [0, 1]);
    manager.renderNodeAtCell('c', c, [1, 0]);
    manager.renderNodeAtCell('d', d, [1, 1]);
    manager.renderNodeAtCell('e', e, [3, 1]);
    manager.renderNodeAtCell('f', f, [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', 'd', null],
      [null, null, null],
      [null, 'e', 'f'],
    ]);

    manager.detachCell(b);
    manager.detachCell(d);
    manager.detachCell(e);

    expect(manager.getCellFor([1, 1], 'column')?.getNode()).toBe('b');

    //@ts-ignore
    manager.pool.removeCell(b);

    expect(manager.getCellFor([1, 1], 'column')?.getNode()).toBe('d');
  });

  test('GridCellManager.isCellRendered', async () => {
    const manager = new GridCellManager('test');

    manager.renderNodeAtCell('a', createCell(), [0, 0]);
    manager.renderNodeAtCell('b', createCell(), [0, 1]);
    manager.renderNodeAtCell('c', createCell(), [1, 0]);
    manager.renderNodeAtCell('d', createCell(), [1, 1]);
    manager.renderNodeAtCell('d', createCell(), [3, 1]);
    manager.renderNodeAtCell('e', createCell(), [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', 'd', null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    expect(manager.isCellAttachedAt([0, 0])).toBe(true);
    expect(manager.isCellAttachedAt([0, 2])).toBe(false);
    expect(manager.isCellAttachedAt([2, 0])).toBe(false);
    expect(manager.isCellAttachedAt([2, 1])).toBe(false);
    expect(manager.isCellAttachedAt([2, 2])).toBe(false);
    expect(manager.isCellAttachedAt([3, 2])).toBe(true);

    manager.detachRow(1);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      [null, null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.detachRow(3);

    expect(manager.getMatrix()).toEqual([['a', 'b']]);
  });

  test('GridCellManager.getCellsOutsideRenderRange', async () => {
    const manager = new GridCellManager('test');

    manager.renderNodeAtCell('a', createCell(), [0, 0]);
    manager.renderNodeAtCell('b', createCell(), [0, 1]);
    manager.renderNodeAtCell('c', createCell(), [1, 0]);
    manager.renderNodeAtCell('d', createCell(), [1, 1]);
    manager.renderNodeAtCell('e', createCell(), [3, 1]);
    manager.renderNodeAtCell('f', createCell(), [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', 'd', null],
      [null, null, null],
      [null, 'e', 'f'],
    ]);

    const cells = manager.getCellsOutsideRenderRange({
      start: [0, 0],
      end: [3, 1],
    });

    expect(cells.size).toBe(4);
    expect([...cells].map((c) => c.getNode())).toEqual(['b', 'd', 'e', 'f']);
  });

  test('GridCellManager.getCellFromListForRow', async () => {
    const manager = new GridCellManager('test');

    const a = manager.renderNodeAtCell('a', createCell(), [0, 0]);
    const b = manager.renderNodeAtCell('b', createCell(), [0, 1]);
    const c = manager.renderNodeAtCell('c', createCell(), [1, 0]);
    const d = manager.renderNodeAtCell('d', createCell(), [1, 1]);
    manager.renderNodeAtCell('e', createCell(), [3, 1]);
    manager.renderNodeAtCell('f', createCell(), [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', 'd', null],
      [null, null, null],
      [null, 'e', 'f'],
    ]);

    const cells = manager.getCellsOutsideRenderRange({
      start: [0, 0],
      end: [3, 1],
    });

    const firstCell = manager.getCellFromListForRow(cells, 3);
    expect(firstCell?.getNode()).toBe('e');

    expect(
      manager.getCellFromListForRow(new Set([a, b, c, d]), 1)?.getNode(),
    ).toBe('c');

    expect(
      manager.getCellFromListForRow(new Set([a, b, d, c]), 1)?.getNode(),
    ).toBe('d');

    expect(
      manager.getCellFromListForColumn(new Set([a, b, d, c]), 1)?.getNode(),
    ).toBe('b');
  });

  test('GridCellManager.discardColsStartingWith', async () => {
    const manager = new GridCellManager('test');

    manager.renderNodeAtCell('a', createCell(), [0, 0]);
    manager.renderNodeAtCell('b', createCell(), [0, 1]);
    manager.renderNodeAtCell('c', createCell(), [1, 0]);
    manager.renderNodeAtCell('d', createCell(), [1, 1]);
    manager.renderNodeAtCell('d', createCell(), [3, 1]);
    manager.renderNodeAtCell('e', createCell(), [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', 'b', null],
      ['c', 'd', null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.detachColsStartingWith(1);

    expect(manager.getMatrix()).toEqual([['a'], ['c']]);

    manager.renderNodeAtCell('d', createCell(), [3, 1]);
    manager.renderNodeAtCell('e', createCell(), [3, 2]);

    expect(manager.getMatrix()).toEqual([
      ['a', null, null],
      ['c', null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);

    manager.detachCol(0);

    expect(manager.getMatrix()).toEqual([
      [null, null, null],
      [null, null, null],
      [null, null, null],
      [null, 'd', 'e'],
    ]);
  });
});
