import { test, expect } from '@playwright/test';
import { FixedSizeMap } from '@src/utils/FixedSizeMap';

type Person = {
  name: string;
  age: number;
  country: string;
};

const john = {
  country: 'uk',
  age: 20,
  name: 'john',
};
const bill = {
  country: 'uk',
  age: 20,
  name: 'bill',
};
const bob = {
  country: 'uk',
  age: 25,
  name: 'bob',
};
const marrie = {
  age: 20,
  country: 'fr',
  name: 'marrie',
};
const jim = {
  age: 22,
  country: 'uk',
  name: 'jim',
};

export default test.describe('FixedSizeMap', () => {
  test('should work fine', async () => {
    const map = new FixedSizeMap<Person, string>(3);

    map.set(john, 'john');
    map.set(bill, 'bill');
    expect(map.size).toBe(2);

    map.set(bob, 'bob');
    expect(map.size).toBe(3);

    map.set(marrie, 'marrie');
    expect(map.size).toBe(3);

    expect(map.has(john)).toBe(false);
    expect(map.has(bill)).toBe(true);
    expect(map.has(bob)).toBe(true);
    expect(map.has(marrie)).toBe(true);

    map.delete(john);
    expect(map.size).toBe(3);
    map.delete(bob);
    expect(map.size).toBe(2);

    map.set(john, 'john');
    map.set(jim, 'jim');
    expect(map.size).toBe(3);

    expect(map.has(bill)).toBe(false);
    expect(map.has(marrie)).toBe(true);
    expect(map.has(john)).toBe(true);
    expect(map.has(jim)).toBe(true);

    expect(Array.from(map.values())).toEqual(['marrie', 'john', 'jim']);
  });
});
