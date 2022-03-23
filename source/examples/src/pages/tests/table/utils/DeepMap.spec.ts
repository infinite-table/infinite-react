import { DeepMap } from '@src/utils/DeepMap';
import { test, expect } from '@playwright/test';

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

export default test.describe.parallel('DeepMap', () => {
  test('constructor should work correctly', () => {
    const map = new DeepMap<Person, number>([
      [[john, bill], 2],
      [[john], 3],
    ]);

    expect(map.get([john, bill])).toEqual(2);
    expect(map.get([john])).toEqual(3);
  });

  test('set/get work correctly with objects as keys', async () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bill], 1);
    map.set([john], 10);
    map.set([bill], 100);
    map.set([], 111);

    map.set([null as unknown as Person], -1);
    map.set([marrie, john, bill], 1000);
    map.set([john, bill, marrie], 2);
    map.set([], 222);

    expect(map.get([john, bill])).toEqual(1);
    expect(map.get([john])).toEqual(10);
    expect(map.get([bill])).toEqual(100);
    expect(map.get([])).toEqual(222);

    expect(map.get([null as unknown as Person])).toEqual(-1);
    expect(map.get([marrie, john, bill])).toEqual(1000);
    expect(map.get([john, bill, marrie])).toEqual(2);
  });

  test('has should work correctly', () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bill], 1);

    expect(map.has([])).toEqual(false);

    map.set([], 2);

    expect(map.has([john])).toEqual(false);
    expect(map.has([john, bill])).toEqual(true);
    expect(map.has([])).toEqual(true);
  });

  test('should be able to set undefined for value', () => {
    const map = new DeepMap<Person, any>();

    map.set([john], undefined);

    expect(map.get([john])).toEqual(undefined);
    expect(map.has([john])).toEqual(true);

    expect(map.has([bob])).toEqual(false);
  });

  test('delete should work correctly', () => {
    const map = new DeepMap<Person, any>();

    map.set([marrie], 'm');
    map.set([john], undefined);
    map.set([john, bob], 1);
    map.set([john, bob, bill], 2);
    map.set([], 3);

    expect(map.size).toEqual(5);

    expect(map.has([john])).toEqual(true);
    expect(map.has([marrie])).toEqual(true);
    expect(map.has([])).toEqual(true);

    expect(map.delete([john])).toBe(true);
    expect(map.delete([bob])).toBe(false);
    expect(map.delete([marrie])).toBe(true);
    expect(map.delete([])).toBe(true);

    expect(map.size).toEqual(2);

    expect(map.get([john])).toBe(undefined);
    expect(map.get([marrie])).toBe(undefined);
    expect(map.get([john, bob])).toBe(1);
  });

  test('values.iterator should keep order - 1', () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bob], 1);
    map.set([john, bob, marrie], 2);
    map.set([], 3);
    map.set([john], 4);

    expect(Array.from(map.values())).toEqual([1, 2, 3, 4]);
  });
  test('keys.iterator should keep order - 1', () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bob], 1);
    map.set([john, bob, marrie], 2);
    map.set([], 3);
    map.set([john], 4);

    expect(Array.from(map.keys())).toEqual([
      [john, bob],
      [john, bob, marrie],
      [],
      [john],
    ]);
  });

  test('entries.iterator should keep order - 1', () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bob], 1);
    map.set([john, bob, marrie], 2);
    map.set([], 3);
    map.set([john], 4);

    expect(Array.from(map.entries())).toEqual([
      [[john, bob], 1],
      [[john, bob, marrie], 2],
      [[], 3],
      [[john], 4],
    ]);
  });

  test('should allow setting empty keys', () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bob], 1);
    expect(map.get([john])).toEqual(undefined);
    expect(map.get([])).toEqual(undefined);
    map.set([], 111);
    expect(map.get([])).toEqual(111);
    map.delete([]);
    expect(map.get([])).toEqual(undefined);
  });

  test('values.iterator should keep order - 2', () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bob], 1);
    map.set([john], 2);
    map.set([john], 1.5);
    map.set([], 2.5);

    map.set([john, bob, marrie], 3);
    map.set([], 3.5);

    expect(Array.from(map.values())).toEqual([1, 1.5, 3, 3.5]);

    map.delete([john]);
    map.set([john], 2);

    expect(Array.from(map.values())).toEqual([1, 3, 3.5, 2]);
  });

  test('keys.iterator should keep order - 2', () => {
    const map = new DeepMap<Person, number>();

    map.set([john, bob], 1);
    map.set([john], 2);
    map.set([], 3);
    map.set([john, bob, marrie], 4);

    const keys = map.keys();
    expect(Array.from(keys)).toEqual([
      [john, bob],
      [john],
      [],
      [john, bob, marrie],
    ]);

    map.delete([john]);

    map.set([john], 5);

    expect(Array.from(map.keys())).toEqual([
      [john, bob],
      [],
      [john, bob, marrie],
      [john],
    ]);
  });

  test('getting a value and modifying it should work correctly', () => {
    const map = new DeepMap<Person, number[]>();

    const arr = [5];
    map.set([john], arr);

    const theArray = map.get([john]);

    expect(theArray).toBe(arr);

    theArray!.push(6);

    expect(map.get([john])).toEqual([5, 6]);

    const arrForEmpty = [10, 20];
    map.set([], arrForEmpty);

    const theArrForEmpty = map.get([]);
    theArrForEmpty!.push(30);
    expect(map.get([])).toEqual([10, 20, 30]);
  });

  test('top down keys', () => {
    const map = new DeepMap<string | number, number>();

    map.set(['uk'], 1);
    map.set(['uk', 20], 2);
    map.set(['fr'], 3);
    map.set(['fr', 20], 4);
    map.set([], 100);
    map.set(['uk', 25], 5);
    map.set(['usa', 50], 50);

    expect(Array.from(map.topDownKeys())).toEqual([
      [],
      ['uk'],
      ['uk', 20],
      ['uk', 25],
      ['fr'],
      ['fr', 20],
      ['usa', 50],
    ]);
  });

  test('visit depth first, with index', () => {
    const map = new DeepMap<string | number, number>();

    map.set(['uk'], 1);
    map.set(['uk', 20], 21);
    map.set(['fr'], 3);
    map.set([], 777);
    map.set(['fr', 20], 4);
    map.set(['uk', 25], 5);
    map.set(['fr', 35], 7);

    map.set(['usa', 5], 81);

    const result: any[] = [];

    map.visitDepthFirst((value, keys, index, next?: () => void) => {
      result.push([value, keys, index]);
      next?.();
    });
    expect(result).toEqual([
      [777, [], 0],
      [1, ['uk'], 0],
      [21, ['uk', 20], 0],
      [5, ['uk', 25], 1],
      [3, ['fr'], 1],
      [4, ['fr', 20], 0],
      [7, ['fr', 35], 1],
      [81, ['usa', 5], 0],
    ]);
  });
});
