import * as React from 'react';

import { useReady } from './useReady';

import {
  DragDropProvider,
  DragList,
  DragListProps,
} from '@infinite-table/infinite-react';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle: React.CSSProperties = {
  height: 40,
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
};

// 30 items of 40px in a list of 200px: the list scrolls by 1000px
const scrollListStyle: React.CSSProperties = {
  width: 200,
  height: 200,
  overflowY: 'auto',
  background: '#eee',
};

const ACCEPT_DROPS_FROM = ['long', 'short'];

const LONG_ITEMS = Array.from({ length: 30 }, (_, index) => `item-${index}`);

export default function App() {
  const ready = useReady();
  const [long, setLong] = React.useState(LONG_ITEMS);
  const [short, setShort] = React.useState(['new-1', 'new-2']);
  const [calls, setCalls] = React.useState<LoggedCall[]>([]);

  const log = (call: LoggedCall) => setCalls((calls) => [...calls, call]);

  const onAcceptDrop: DragListProps['onAcceptDrop'] = (options) => {
    log({ name: 'long.onAcceptDrop', ...options });

    const newItems = [...long];
    newItems.splice(options.dropIndex, 0, options.dragItemId);
    setLong(newItems);
  };

  return (
    <div style={{ padding: 20 }} data-ready={ready}>
      <DragDropProvider>
        <div style={{ display: 'flex', gap: 50 }}>
          <DragList
            dragListId="long"
            orientation="vertical"
            acceptDropsFrom={ACCEPT_DROPS_FROM}
            onDrop={(sortedIndexes, options) => {
              log({
                name: 'long.onDrop',
                dragIndex: options.dragIndex,
                dropIndex: options.dropIndex,
              });
              setLong(sortedIndexes.map((index) => long[index]));
            }}
            onAcceptDrop={onAcceptDrop}
          >
            {(domProps) => (
              <div {...domProps} data-name="long" style={scrollListStyle}>
                {long.map((id) => (
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

          <DragList
            dragListId="short"
            orientation="vertical"
            onDrop={() => {}}
            onRemove={(sortedIndexes, options) => {
              log({ name: 'short.onRemove', dragItemId: options.dragItemId });
              setShort(sortedIndexes.map((index) => short[index]));
            }}
          >
            {(domProps) => (
              <div
                {...domProps}
                data-name="short"
                style={{ width: 200, height: 200, background: '#eee' }}
              >
                {short.map((id) => (
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
        </div>
      </DragDropProvider>

      <pre data-name="log">{JSON.stringify(calls)}</pre>
    </div>
  );
}
