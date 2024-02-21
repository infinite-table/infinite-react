import { test, expect } from '@playwright/test';
import { FixedSizeSet } from '@src/utils/FixedSizeSet';

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

export default test.describe('FixedSizeSet', () => {
  test('should work fine', async () => {
    const map = new FixedSizeSet<Person>(3);

    map.add(john);
    map.add(bill);
    expect(map.size).toBe(2);

    map.add(bob);
    expect(map.size).toBe(3);

    map.add(marrie);
    expect(map.size).toBe(3);

    expect(map.has(john)).toBe(false);
    expect(map.has(bill)).toBe(true);
    expect(map.has(bob)).toBe(true);
    expect(map.has(marrie)).toBe(true);

    map.delete(john);
    expect(map.size).toBe(3);
    map.delete(bob);
    expect(map.size).toBe(2);

    map.add(john);
    map.add(jim);
    expect(map.size).toBe(3);

    expect(map.has(bill)).toBe(false);
    expect(map.has(marrie)).toBe(true);
    expect(map.has(john)).toBe(true);
    expect(map.has(jim)).toBe(true);
  });
});
