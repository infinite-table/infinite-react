import * as React from 'react';

import { useReady } from './useReady';

import { DragDropProvider, DragList } from '@infinite-table/infinite-react';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle: React.CSSProperties = {
  height: 40,
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
};

/**
 * A provider with one list in it. Both lists on the page have items with
 * the same ids, the lists themselves have different ids.
 */
function ProviderWithList(props: {
  name: 'first' | 'second';
  log: (call: LoggedCall) => void;
}) {
  const { name, log } = props;
  const [items, setItems] = React.useState(['a', 'b', 'c']);

  return (
    <DragDropProvider>
      <DragList
        dragListId={name}
        orientation="vertical"
        onDrop={(sortedIndexes, options) => {
          log({ name: `${name}.onDrop`, dragItemId: options.dragItemId });
          setItems(sortedIndexes.map((index) => items[index]));
        }}
        onRemove={(sortedIndexes, options) => {
          log({ name: `${name}.onRemove`, dragItemId: options.dragItemId });
          setItems(sortedIndexes.map((index) => items[index]));
        }}
        onAcceptDrop={(options) => {
          log({ name: `${name}.onAcceptDrop`, dragItemId: options.dragItemId });
        }}
      >
        {(domProps) => (
          <div
            {...domProps}
            data-name={name}
            style={{ width: 200, height: 240, background: '#eee' }}
          >
            {items.map((id) => (
              <DragList.DraggableItem key={id} id={id}>
                {(itemDomProps) => (
                  <div {...itemDomProps} style={itemStyle}>
                    {id}
                  </div>
                )}
              </DragList.DraggableItem>
            ))}
          </div>
        )}
      </DragList>
    </DragDropProvider>
  );
}

export default function App() {
  const ready = useReady();
  const [calls, setCalls] = React.useState<LoggedCall[]>([]);

  const log = React.useCallback((call: LoggedCall) => {
    setCalls((calls) => [...calls, call]);
  }, []);

  return (
    <div style={{ padding: 20 }} data-ready={ready}>
      <div style={{ display: 'flex', gap: 50 }}>
        <ProviderWithList name="first" log={log} />
        <ProviderWithList name="second" log={log} />
      </div>

      <pre data-name="log">{JSON.stringify(calls)}</pre>
    </div>
  );
}
