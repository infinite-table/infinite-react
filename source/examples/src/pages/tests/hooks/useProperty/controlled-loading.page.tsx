import React, { useState } from 'react';
import { LoadingCmp } from './LoadingCmp';

const sinon = require('sinon');

const onLoadingChange = sinon.spy((_loading: boolean) => {});

(globalThis as any).onLoadingChange = onLoadingChange;

const UsePropertyTest = () => {
  const [loading, setLoading] = useState<boolean | undefined>(false);
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
        loading={loading}
        onLoadingChange={(loading) => {
          onLoadingChange(loading);
          setLoading(loading);
        }}
      ></LoadingCmp>
    </div>
  );
};

export default UsePropertyTest;
