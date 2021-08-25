import React, { useState } from 'react';

import { Counter } from './CounterCmp';

const sinon = require('sinon');

const onValueChange = sinon.spy((_sortInfo: any) => {});

(globalThis as any).onValueChange = onValueChange;

const CounterTest = () => {
  const [value, setValue] = useState<number>(10);
  return (
    <div>
      <button
        id="outsideinc"
        onClick={() => {
          setValue(value + 1);
        }}
      >
        outside inc
      </button>
      <button
        id="outsidedec"
        onClick={() => {
          setValue(value - 1);
        }}
      >
        outside dec
      </button>
      <Counter
        defaultValue={value}
        onValueChange={(value: number) => {
          onValueChange(value);
        }}
      ></Counter>
    </div>
  );
};

export default CounterTest;
