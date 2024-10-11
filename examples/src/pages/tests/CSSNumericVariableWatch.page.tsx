import { CSSNumericVariableWatch } from '@src/components/CSSNumericVariableWatch';
import { useState } from 'react';

(globalThis as any).heights = [];

export default function App() {
  const [height, setHeight] = useState(10);
  const [rerender, setRerender] = useState(0);
  return (
    //@ts-ignore
    <div style={{ '--current-height': height }}>
      <button onClick={() => setHeight(height + 1)}>inc</button>
      <CSSNumericVariableWatch
        varName="--current-height"
        allowInts
        onChange={(value) => {
          (globalThis as any).heights.push(value);
          setRerender(rerender + 1);
        }}
      />
      current height: {height}
      <div>heights: {JSON.stringify((globalThis as any).heights)}</div>
    </div>
  );
}
