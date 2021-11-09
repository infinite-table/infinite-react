import React, { useState } from 'react';
import { LoadingCmp } from './LoadingCmp';

const sinon = require('sinon');

const onLoadingChange = sinon.spy((_loading: boolean) => {});

(globalThis as any).onLoadingChange = onLoadingChange;

const UsePropertyTest = () => {
  const [loading, setLoading] = useState<boolean | undefined>(true);
  return (
    <div>
      <button
        id="outsidetoggle"
        onClick={() => {
          setLoading(!loading);
        }}
      >
        toggle
      </button>
      <LoadingCmp
        defaultLoading={loading}
        onLoadingChange={onLoadingChange}
      ></LoadingCmp>
    </div>
  );
};

export default UsePropertyTest;
