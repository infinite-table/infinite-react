import { useEffectWithChanges } from '@infinite-table/infinite-react';
import { useRef, useState } from 'react';

export default function Test() {
  const [counter, setCounter] = useState(0);
  const [_other, setOther] = useState(0);
  const timesRef = useRef<HTMLDivElement>(null);

  useEffectWithChanges(
    () => {
      (globalThis as any).timesCalled =
        ((globalThis as any).timesCalled || 0) + 1;

      timesRef.current!.innerHTML = `${(globalThis as any).timesCalled}`;
    },
    {
      counter,
    },
  );

  return (
    <div style={{ color: 'white', background: 'black', textAlign: 'center' }}>
      <button
        onClick={() => {
          setCounter((counter) => counter + 1);
        }}
      >
        inc
      </button>
      <div data-name="counter">{counter}</div>
      <div>
        Was called{' '}
        <p style={{ display: 'inline' }} data-name="times" ref={timesRef}></p>
      </div>
      <button onClick={() => setOther((o) => o + 1)}>
        rerender with no effect
      </button>
    </div>
  );
}
