import React, { useState } from 'react';
import { CounterCmp } from './LoadingCmp';

const sinon = require('sinon');

const onCountChange = sinon.spy((_loading: boolean) => {});

(globalThis as any).onCountChange = onCountChange;

const UsePropertyTest = () => {
  const [count, setCount] = useState(10);
  return (
    <div>
      <button
        id="outer"
        onClick={() => {
          setCount(count + 1);
        }}
      >
        inc
      </button>
      <CounterCmp
        count={count}
        onCountChange={(count) => {
          onCountChange(count);
          setCount(count);
        }}
      ></CounterCmp>
    </div>
  );
};

export default UsePropertyTest;
