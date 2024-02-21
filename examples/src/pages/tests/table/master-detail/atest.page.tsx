import { useEffectWithChanges } from '@infinite-table/infinite-react';

export default function App() {
  useEffectWithChanges(
    (changes) => {
      console.log({ changes });
    },
    {
      rowId: 1,
    },
  );
  return (
    <div>
      <div style={{ color: 'red' }}>hello world</div>
    </div>
  );
}
