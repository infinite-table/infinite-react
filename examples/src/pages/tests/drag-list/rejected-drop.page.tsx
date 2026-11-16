import * as React from 'react';

import { useReady } from './useReady';

import {
  DragDropProvider,
  DragList,
  DragListProps,
  useDragDropProvider,
} from '@infinite-table/infinite-react';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle: React.CSSProperties = {
  height: 40,
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
};

const ACCEPT_DROPS_FROM_SOURCE = ['source'];

// the target takes every item but the one called "locked"
const shouldAcceptDrop: DragListProps['shouldAcceptDrop'] = (event) =>
  event.dragItem.id !== 'locked';

function Lists(props: { log: (call: LoggedCall) => void }) {
  const { log } = props;
  const [source, setSource] = React.useState(['free', 'locked', 'other']);
  const [target, setTarget] = React.useState(['t1', 't2']);

  const { getCurrentDragSourceAndTarget } = useDragDropProvider();

  const onRemove: DragListProps['onRemove'] = (sortedIndexes, options) => {
    // the provider still has the state of the drag when the callbacks run
    const { status, dropTargetListId } = getCurrentDragSourceAndTarget();

    log({ name: 'source.onRemove', ...options, status, dropTargetListId });

    if (status === 'rejected') {
      return;
    }
    setSource(sortedIndexes.map((index) => source[index]));
  };

  const onAcceptDrop: DragListProps['onAcceptDrop'] = (options) => {
    log({ name: 'target.onAcceptDrop', ...options });

    const newItems = [...target];
    newItems.splice(options.dropIndex, 0, options.dragItemId);
    setTarget(newItems);
  };

  return (
    <div style={{ display: 'flex', gap: 50 }}>
      <DragList
        dragListId="source"
        orientation="vertical"
        onDrop={(sortedIndexes) => {
          log({ name: 'source.onDrop', sortedIndexes });
          setSource(sortedIndexes.map((index) => source[index]));
        }}
        onRemove={onRemove}
      >
        {(domProps) => (
          <div
            {...domProps}
            data-name="source"
            style={{ width: 200, height: 240, background: '#eee' }}
          >
            {source.map((id) => (
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
        dragListId="target"
        orientation="vertical"
        acceptDropsFrom={ACCEPT_DROPS_FROM_SOURCE}
        shouldAcceptDrop={shouldAcceptDrop}
        onDrop={(sortedIndexes) => {
          log({ name: 'target.onDrop', sortedIndexes });
        }}
        onAcceptDrop={onAcceptDrop}
      >
        {(domProps) => (
          <div
            {...domProps}
            data-name="target"
            style={{ width: 200, height: 240, background: '#eee' }}
          >
            {target.map((id) => (
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
      <DragDropProvider>
        {({ dragSourceListId, dropTargetListId, dragItemId, status }) => (
          <>
            <Lists log={log} />
            <pre data-name="provider-state">
              {JSON.stringify({
                dragSourceListId,
                dropTargetListId,
                dragItemId,
                status,
              })}
            </pre>
          </>
        )}
      </DragDropProvider>

      <pre data-name="log">{JSON.stringify(calls)}</pre>
    </div>
  );
}
