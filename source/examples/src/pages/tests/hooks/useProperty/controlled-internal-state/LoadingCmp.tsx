import { useProperty } from '@src/components/hooks/useProperty';
import { useState } from 'react';

export type CounterCmpProps = {
  count?: number;
  defaultCount?: number;
  onCountChange?: (count: number) => void;
};
export const CounterCmp = (props: CounterCmpProps) => {
  const [state, setState] = useState({
    count: props.defaultCount ?? 0,
  });

  const [count, setCount] = useProperty('count', props, {
    controlledToState: true,
    fromState: () => state.count,
    setState: (count: number) => setState({ count }),
  });
  return (
    <div>
      <div id="text">
        {JSON.stringify({
          state: state.count,
          value: count,
        })}
      </div>

      <button
        id="inner"
        onClick={() => {
          setCount(state.count + 1);
        }}
      >
        increment
      </button>
    </div>
  );
};
