import React, { useState } from 'react';

import { SortInfoCmpProps, SortInfoCmp } from './SortInfoCmp';

const sinon = require('sinon');

const onSortInfoChange = sinon.spy((_sortInfo: any) => {});

(globalThis as any).onSortInfoChange = onSortInfoChange;

const SortInfoTest = () => {
  const [sortInfo, setSortInfo] = useState<SortInfoCmpProps['sortInfo']>({
    dir: 1,
    field: 'age',
  });
  return (
    <div>
      <button
        id="outsidetoggle"
        onClick={() => {
          let newSortInfo = sortInfo;
          if (newSortInfo && !Array.isArray(newSortInfo)) {
            newSortInfo = [newSortInfo];
          }
          if (!newSortInfo) {
            newSortInfo = [{ dir: 1, field: 'age' }];
          }
          setSortInfo({
            dir: -newSortInfo[0].dir as 1 | -1,
            field: newSortInfo[0].field,
          });
        }}
      >
        toggle
      </button>
      <SortInfoCmp
        sortInfo={sortInfo}
        onSortInfoChange={(sortInfo) => {
          onSortInfoChange(sortInfo);
          setSortInfo(sortInfo);
        }}
      ></SortInfoCmp>
    </div>
  );
};

export default SortInfoTest;
