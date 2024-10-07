import { useEffectWhen } from '@infinite-table/infinite-react';
import { useState } from 'react';

(globalThis as any).effectCalls = 0;
function Cmp({ counter1, counter2 }: { counter1: number; counter2: number }) {
  useEffectWhen(
    () => {
      (globalThis as any).effectCalls++;
      console.log('effect calls', (globalThis as any).effectCalls);
    },
    {
      same: [counter1],
      different: [counter2],
    },
  );

  return (
    <div>
      counter1={counter1} - counter2={counter2}
    </div>
  );
}

export default function App() {
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);
  const [rerender, setRerender] = useState(0);
  return (
    <div>
      <button onClick={() => setCounter1(counter1 + 1)}>inc1</button>
      <button onClick={() => setCounter2(counter2 + 1)}>inc2</button>
      <button onClick={() => setRerender(rerender + 1)}>re-render</button>
      <button
        onClick={() => {
          setRerender(rerender + 1);
          setCounter1(counter1 + 1);
        }}
      >
        try
      </button>
      <Cmp counter1={counter1} counter2={counter2} />
      rerender {rerender}
    </div>
  );
}
