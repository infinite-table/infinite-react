import { test, expect } from '@playwright/test';
import {
  ListRowManager,
  ListRowInterface,
} from '@src/components/HeadlessTable/ListRowManager';

const createRow = (node?: string): ListRowInterface => {
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
  };
};
export default test.describe('ListRowManager', () => {
  test('ListRowManager.discardRowsStartingWith', async () => {
    const manager = new ListRowManager('test');

    const a = createRow('a');
    const b = createRow('b');
    const c = createRow('c');
    const d = createRow('d');
    const e = createRow('e');

    manager.renderNodeAtRow('a', a, 0);
    manager.renderNodeAtRow('b', b, 2);
    manager.renderNodeAtRow('c', c, 3);
    manager.renderNodeAtRow('d', d, 4);
    manager.renderNodeAtRow('e', e, 6);

    expect(manager.getList()).toEqual(['a', null, 'b', 'c', 'd', null, 'e']);

    manager.detachStartingWith(5);

    expect(manager.getList()).toEqual(['a', null, 'b', 'c', 'd']);

    manager.detachRow(a);
    manager.detachRowAt(2);

    expect(manager.getList()).toEqual([null, null, null, 'c', 'd']);

    manager.renderNodeAtRow('a', a, 1);

    expect(manager.getList()).toEqual([null, 'a', null, 'c', 'd']);

    manager.renderNodeAtRow('f', a, 1);
    expect(manager.getList()).toEqual([null, 'f', null, 'c', 'd']);

    expect(a.getNode()).toEqual('f');
    expect(b.getNode()).toEqual('b');

    manager.makeDetachedRowsEmpty();

    expect(b.getNode()).toEqual(null);

    expect(manager.getList()).toEqual([null, 'f', null, 'c', 'd']);
  });
});
