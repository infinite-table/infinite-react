import { useState } from 'react';

import { RawList } from '@infinite-table/infinite-react/src/components/RawList';
import { RenderItem } from '@infinite-table/infinite-react/src/components/RawList/types';
import { VirtualBrain } from '@infinite-table/infinite-react/src/components/VirtualBrain';

const brain: VirtualBrain = new VirtualBrain({
  itemSize: () => {
    return 50;
  },
  mainAxis: 'horizontal',
  count: 100,
}) as VirtualBrain;

brain.setAvailableSize({
  width: 500,
  height: 100,
});
(globalThis as any).brain = brain;

const renderItem: RenderItem = ({ itemIndex, itemSize, domRef }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: itemIndex * 50,
        border: '1px solid red',
        width: itemSize,
      }}
      ref={domRef}
    >
      #{itemIndex}
    </div>
  );
};
const App = () => {
  const [size, setSize] = useState(500);
  return (
    <div>
      <button
        style={{ top: 200, position: 'relative' }}
        onClick={() => {
          const newSize = size === 500 ? 300 : 500;
          setSize(newSize);
          brain.setAvailableSize({
            width: newSize,
            height: 0,
          });
        }}
      >
        toggle size - current size - {size}
      </button>
      <RawList brain={brain} renderItem={renderItem}></RawList>
    </div>
  );
};
export default App;
