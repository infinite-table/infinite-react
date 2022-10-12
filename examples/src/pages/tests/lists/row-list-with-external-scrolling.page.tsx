import { VirtualBrain } from '@src/components/VirtualBrain';
import { RowListWithExternalScrolling } from '@src/components/VirtualList/RowListWithExternalScrolling';
import { RenderRow } from '@src/components/VirtualList/types';

const COUNT = 100;
const brain = new VirtualBrain({
  count: COUNT,
  itemSize: 50,
  mainAxis: 'vertical',
});

const emptyFn = () => {};
(globalThis as any).brain = brain;

const renderRow: RenderRow = ({ rowIndex, domRef }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      ref={domRef}
    >
      row {rowIndex}
    </div>
  );
};
const App = () => {
  return (
    <RowListWithExternalScrolling
      brain={brain}
      renderRow={renderRow}
      updateScroll={emptyFn}
      onMount={(node) => {
        const { width, height } = node.getBoundingClientRect();
        brain.setAvailableSize({ width, height });
      }}
      style={{ margin: 10, height: 300, width: '50%', border: '1px solid red' }}
    />
  );
};
export default App;
