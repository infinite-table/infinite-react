import { RawList } from '@src/components/RawList';
import { RenderItem } from '@src/components/RawList/types';
import { VirtualBrain } from '@src/components/VirtualBrain';

const brain = new VirtualBrain({
  count: 100,
  itemSize: 50,
  mainAxis: 'vertical',
});

(globalThis as any).brain = brain;

const renderItem: RenderItem = ({ itemIndex, domRef }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      ref={domRef}
    >
      #{itemIndex}
    </div>
  );
};
const App = () => {
  return (
    <div>
      <RawList brain={brain} renderItem={renderItem}></RawList>;
    </div>
  );
};
export default App;
