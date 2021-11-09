import React, { useState } from 'react';
import { LoadingCmp } from './LoadingCmp';

const sinon = require('sinon');

const onLoadingChange = sinon.spy((_loading: boolean) => {});

(globalThis as any).onLoadingChange = onLoadingChange;

const UsePropertyTest = () => {
  const [loading] = useState<boolean | undefined>(false);
  return (
    <div>
      <LoadingCmp
        loading={loading}
        onLoadingChange={onLoadingChange}
      ></LoadingCmp>
    </div>
  );
};

export default UsePropertyTest;
