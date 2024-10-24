import * as React from 'react';

import { useDataSourceInternal } from '@src/index';

const sinon = require('sinon');

const data = sinon.spy(() => {
  return [
    { name: 'bob', age: 1, id: 1 },
    { name: 'bill', age: 2, id: 2 },
  ];
});

(globalThis as any).dataFn = data;
export default () => {
  const { state } = useDataSourceInternal({
    data,
    primaryKey: (d: any) => d.id,
  });
  (globalThis as any).dataSourceState = state;
  return <div>hello</div>;
};
