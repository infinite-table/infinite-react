import { RawList } from '@src/components/RawList';
import { RenderItem } from '@src/components/RawList/types';
import { VirtualBrain } from '@src/components/VirtualBrain';

const brain = new VirtualBrain({
  count: 100,
  itemSize: 50,
  mainAxis: 'vertical',
});

(globalThis as any).brain = brain;

brain.setAvailableSize({ height: 100, width: 0 });

const itemSpan = ({ itemIndex }: { itemIndex: number }) => {
  return itemIndex % 5 === 0 ? 2 : 1;
};

const renderItem: RenderItem = ({ itemIndex, domRef }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      ref={domRef as React.Ref<HTMLDivElement>}
    >
      #{itemIndex}
    </div>
  );
};
const App = () => {
  return (
    <div>
      <RawList
        brain={brain}
        renderItem={renderItem}
        itemSpan={itemSpan}
      ></RawList>
    </div>
  );
};
export default App;
