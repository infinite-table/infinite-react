import { multisort } from '@src/utils/multisort';

export default describe('multisort', () => {
  it('should sort empty array', () => {
    expect(multisort([], [])).toEqual([]);
  });

  it('should not sort when no sort info provided', () => {
    expect(multisort([], [3, 1, 2])).toEqual([3, 1, 2]);
  });

  it('should sort using string order on number, when no type provided', () => {
    expect(
      multisort(
        [
          {
            dir: 1,
          },
        ],
        [30, 11, 22, 3],
      ),
    ).toEqual([11, 22, 3, 30]);
  });

  it('should sort using numeric order on number, when number type provided', () => {
    expect(
      multisort(
        [
          {
            dir: 1,
            type: 'number',
          },
        ],
        [30, 11, 22, 3],
      ),
    ).toEqual([3, 11, 22, 30]);
  });

  it('should sort using numeric order on number, when number type provided, and field is specified', () => {
    expect(
      multisort(
        [
          {
            dir: 1,
            field: 'value',
            type: 'number',
          },
        ],
        [{ value: 30 }, { value: 11 }, { value: 22 }, { value: 3 }],
      ),
    ).toEqual([{ value: 3 }, { value: 11 }, { value: 22 }, { value: 30 }]);
  });

  it('should do sorting on multiple fields. when no field provided, should call the fn with the object', () => {
    expect(
      multisort(
        [
          { dir: -1, field: 'name', type: 'string' },
          {
            dir: 1,
            field: 'age',
            type: 'number',
          },
          {
            dir: -1,
            fn: (p1, p2) => {
              return p1.v - p2.v;
            },
          },
        ],
        [
          { name: 'bob', age: 40 },
          { name: 'bob', age: 30 },
          { name: 'mary', age: 11, v: 2 },
          { name: 'mary', age: 11, v: 1 },
          { name: 'mary', age: 11, v: 3 },
          { name: 'zebra', age: 22 },
          { name: 'aby', age: 3 },
        ],
      ),
    ).toEqual([
      { name: 'zebra', age: 22 },

      { name: 'mary', age: 11, v: 3 },
      { name: 'mary', age: 11, v: 2 },
      { name: 'mary', age: 11, v: 1 },

      { name: 'bob', age: 30 },
      { name: 'bob', age: 40 },

      { name: 'aby', age: 3 },
    ]);
  });

  it('should do sorting on multiple fields. when field provided, should call the fn with the value ', () => {
    expect(
      multisort(
        [
          { dir: -1, field: 'name', type: 'string' },
          {
            dir: 1,
            field: 'age',
            fn: (a, b) => a - b,
          },
          {
            dir: -1,
            fn: (p1, p2) => {
              return p1.v - p2.v;
            },
          },
        ],
        [
          { name: 'bob', age: 40 },
          { name: 'bob', age: 30 },
          { name: 'mary', age: 11, v: 2 },
          { name: 'mary', age: 11, v: 1 },
          { name: 'mary', age: 11, v: 3 },
          { name: 'zebra', age: 22 },
          { name: 'aby', age: 3 },
        ],
      ),
    ).toEqual([
      { name: 'zebra', age: 22 },

      { name: 'mary', age: 11, v: 3 },
      { name: 'mary', age: 11, v: 2 },
      { name: 'mary', age: 11, v: 1 },

      { name: 'bob', age: 30 },
      { name: 'bob', age: 40 },

      { name: 'aby', age: 3 },
    ]);
  });
});
