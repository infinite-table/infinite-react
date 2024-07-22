import { DataClient, queryKeyToCacheKey } from './DataClient';

it('should work', () => {
  new DataClient({
    name: 'x',
  });

  try {
    new DataClient({
      name: 'x',
    });
  } catch (e) {
    //@ts-ignore ignore
    expect(e.message).toContain('There\'s already a DataClient with name "x"');
  }
});

it('query result from cache', async () => {
  const client = new DataClient({
    name: 'client',
  });

  await client
    .awaitQuery({
      name: 'first',
      fn: async () => 1,
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });

  // should take value from cache
  await client
    .awaitQuery({
      name: 'second',
      fn: async () => 10000,
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });
});

it('query result from cache2', async () => {
  const client = new DataClient({
    name: 'client2',
  });

  // dont await
  client
    .awaitQuery({
      name: 'first',
      fn: async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(1);
          }, 100);
        }),
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });

  // even though this query is quicker, it will wait for the previous one to finish
  // since that is in the cache for this key
  await client
    .awaitQuery({
      name: 'second',
      fn: async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(200);
          }, 10);
        }),
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });

  // should take value from cache
  await client
    .awaitQuery({
      name: 'third',
      fn: async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(250);
          }, 15);
        }),
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });
});

it('query result from cache3', async () => {
  const client = new DataClient({
    name: 'client3',
  });

  // wait for this before moving on
  await client
    .awaitQuery({
      name: 'first',
      fn: async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(1);
          }, 100);
        }),
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });

  // should  have value from cache, since we awaited for the first query to finish
  await client
    .awaitQuery({
      name: 'second',
      fn: async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(200);
          }, 10);
        }),
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });

  // should take value from cache
  await client
    .awaitQuery({
      name: 'third',
      fn: async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(250);
          }, 15);
        }),
      key: ['test'],
    })
    .then(({ result }) => {
      expect(result).toEqual(1);
    });
});

describe('DataClient', () => {
  it('query result from cache4', async () => {
    const client = new DataClient({
      name: 'client4',
    });

    client
      .awaitQuery({
        name: 'first',
        fn: async () =>
          new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject('error during query');
            }, 100);
          }),
        key: ['test'],
      })
      .then((resolution) => {
        expect(resolution).toEqual({
          done: true,
          state: 'error',
          result: undefined,
          doneAt: expect.any(Number),
          error: 'error during query',
        });
      });

    // this should not take value from cache, since the first query errors
    await client
      .awaitQuery({
        name: 'second',
        fn: async () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(200);
            }, 10);
          }),
        key: ['test'],
      })
      .then(({ result }) => {
        expect(result).toEqual(200);
      });

    // should take value from cache
    await client
      .awaitQuery({
        name: 'third',
        fn: async () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(250);
            }, 15);
          }),
        key: ['test'],
      })
      .then(({ result }) => {
        expect(result).toEqual(200);
      });
  });
});

it('queryCacheKey', () => {
  expect(queryKeyToCacheKey(1)).toEqual(1);
  expect(queryKeyToCacheKey('test')).toEqual('test');
  expect(queryKeyToCacheKey(true)).toEqual(true);
  expect(queryKeyToCacheKey(false)).toEqual(false);
  expect(queryKeyToCacheKey([2, 4, 5])).toEqual([2, 4, 5]);

  const expected = JSON.stringify({ a: 2, b: 1, name: 'john' });

  expect(queryKeyToCacheKey({ name: 'john', b: 1, a: 2 })).toEqual(expected);
  expect(
    queryKeyToCacheKey({
      b: 1,
      xxx: undefined,
      name: 'john',
      a: 2,
    }),
  ).toEqual(expected);

  expect(queryKeyToCacheKey(['test', { name: 'john', b: 1, a: 2 }])).toEqual([
    'test',
    expected,
  ]);
});
