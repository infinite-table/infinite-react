import React from 'react';

import { SortInfoCmpProps, SortInfoCmp } from './SortInfoCmp';

const sinon = require('sinon');

const onSortInfoChange = sinon.spy((_sortInfo: any) => {});

(globalThis as any).onSortInfoChange = onSortInfoChange;

const sortInfo: SortInfoCmpProps['sortInfo'] = {
  dir: 1,
  field: 'age',
};
const SortInfoTest = () => {
  return (
    <div>
      <SortInfoCmp
        sortInfo={sortInfo}
        onSortInfoChange={onSortInfoChange}
      ></SortInfoCmp>
    </div>
  );
};

export default SortInfoTest;
