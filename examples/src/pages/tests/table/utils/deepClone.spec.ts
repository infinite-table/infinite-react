import { test, expect } from '@playwright/test';
import { deepClone } from '@src/utils/deepClone';

export default test.describe('deepClone', () => {
  test('delete should work properly', () => {
    var o = {
      firstName: 'test',
      last: [4, 1, new Date('2020-02-20')],
    };

    const clone = deepClone(o);
    expect(clone).toEqual(o);
    expect(clone.last[2].toString()).toEqual(o.last[2].toString());

    const m = new Map();
    m.set('x', { x: new Map([[o, 111]]) });
    const source = ['a', { x: 'y' }, m];
    const target = deepClone(source);

    expect(target).toEqual(source);

    const clonedMap = target[2].get('x').x;
    const firstKey = [...clonedMap.keys()][0];

    expect(firstKey.last[2]).toEqual(new Date('2020-02-20'));
  });
});
