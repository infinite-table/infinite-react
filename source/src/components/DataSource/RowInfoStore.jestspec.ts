import { createRowInfoStore } from './RowInfoStore';

const rowInfo = (data: Record<string, unknown>) =>
  ({
    id: 1,
    data,
    indexInAll: 0,
    rowSelected: false,
    isGroupRow: false,
    dataSourceHasGrouping: false,
    isTreeNode: false,
  } as any);

describe('RowInfoStore', () => {
  test('notifies a row whose date value changed', async () => {
    const store = createRowInfoStore<any>();
    store.notifyDataArray([rowInfo({ date: new Date(2026, 0, 1) })]);

    const callback = jest.fn();
    store.subscribeToRowIndex(0, callback);

    // the subscribers are notified in a microtask
    const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

    store.notifyDataArray([rowInfo({ date: new Date(2026, 0, 2) })]);
    await flush();
    expect(callback).toHaveBeenCalledTimes(1);

    // the same date in a new Date object: no change
    store.notifyDataArray([rowInfo({ date: new Date(2026, 0, 2) })]);
    await flush();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
