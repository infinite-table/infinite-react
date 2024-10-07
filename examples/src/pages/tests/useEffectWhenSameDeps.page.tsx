import { useEffectWhenSameDeps } from '@infinite-table/infinite-react';
import { useState } from 'react';

(globalThis as any).effectCalls = 0;
function Cmp({ counter }: { counter: number }) {
  useEffectWhenSameDeps(() => {
    (globalThis as any).effectCalls++;
    console.log('effect calls', (globalThis as any).effectCalls);
  }, [counter]);

  return <div>counter {counter}</div>;
}

export default function App() {
  const [counter, setCounter] = useState(0);
  const [rerender, setRerender] = useState(0);
  return (
    <div>
      <button onClick={() => setCounter(counter + 1)}>inc</button>
      <button onClick={() => setRerender(rerender + 1)}>re-render</button>
      <Cmp counter={counter} />
      rerender {rerender}
    </div>
  );
}
