import { proxyFn } from '@src/utils/proxyFnCall';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('ProxyFnCall', () => {
  test('should work ok', () => {
    const getState = (props: any) => {
      const getRowHeight = (x: any) => {
        return x.rowHeight;
      };

      if (props.xyz) {
        props.zzz++;
      }
      return {
        rowHeight: getRowHeight(props),
        list: [3, 4, 5],
        test: props.test,
        name: props.name,
      };
    };

    const { fn, propertyReads } = proxyFn(getState);

    const result = fn({ rowHeight: 10, test: 'testing' });

    expect(result).toEqual({
      rowHeight: 10,
      test: 'testing',
      name: undefined,
      list: [3, 4, 5],
    });
    expect([...propertyReads]).toEqual(['xyz', 'rowHeight', 'test', 'name']);
  });
});
