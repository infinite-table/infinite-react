import * as React from 'react';

import {
  DragDropProvider,
  DragList,
  DragListProps,
  useDragDropProvider,
  useDragListContext,
} from '@infinite-table/infinite-react';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle: React.CSSProperties = {
  height: 40,
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
};

const ACCEPT_DROPS_FROM = ['left', 'right'];

/**
 * Shows what useDragDropProvider gives.
 */
function ProviderState() {
  const { dragSourceListId, dropTargetListId, dragItemId, status } =
    useDragDropProvider();

  return (
    <pre data-name="provider-state">
      {JSON.stringify({
        dragSourceListId,
        dropTargetListId,
        dragItemId,
        status,
      })}
    </pre>
  );
}

/**
 * Shows what useDragListContext gives, inside a list.
 */
function ListState() {
  const { dragListId, draggingInProgress, dragSourceListId, dropTargetListId } =
    useDragListContext();

  return (
    <pre data-name={`list-state-${dragListId}`}>
      {JSON.stringify({
        dragListId,
        draggingInProgress,
        dragSourceListId,
        dropTargetListId,
      })}
    </pre>
  );
}

function List(props: {
  name: 'left' | 'right';
  items: string[];
  setItems: (items: string[]) => void;
  log: (call: LoggedCall) => void;
}) {
  const { name, items, setItems, log } = props;

  const onDrop: DragListProps['onDrop'] = (sortedIndexes, options) => {
    log({ name: `${name}.onDrop`, sortedIndexes, ...options });
    setItems(sortedIndexes.map((index) => items[index]));
  };

  const onRemove: DragListProps['onRemove'] = (sortedIndexes, options) => {
    log({ name: `${name}.onRemove`, sortedIndexes, ...options });
    setItems(sortedIndexes.map((index) => items[index]));
  };

  const onAcceptDrop: DragListProps['onAcceptDrop'] = (options) => {
    log({ name: `${name}.onAcceptDrop`, ...options });

    const newItems = [...items];
    newItems.splice(options.dropIndex, 0, options.dragItemId);
    setItems(newItems);
  };

  return (
    <DragList
      dragListId={name}
      orientation="vertical"
      acceptDropsFrom={ACCEPT_DROPS_FROM}
      onDrop={onDrop}
      onRemove={onRemove}
      onAcceptDrop={onAcceptDrop}
    >
      {(domProps) => (
        <div style={{ width: 200 }}>
          <div
            {...domProps}
            data-name={name}
            style={{ height: 240, background: '#eee' }}
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
          <ListState />
        </div>
      )}
    </DragList>
  );
}

export default function App() {
  const [left, setLeft] = React.useState(['a', 'b', 'c']);
  const [right, setRight] = React.useState(['x', 'y', 'z']);
  const [calls, setCalls] = React.useState<LoggedCall[]>([]);

  const log = React.useCallback((call: LoggedCall) => {
    setCalls((calls) => [...calls, call]);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <DragDropProvider>
        <div style={{ display: 'flex', gap: 50 }}>
          <List name="left" items={left} setItems={setLeft} log={log} />
          <List name="right" items={right} setItems={setRight} log={log} />
        </div>
        <ProviderState />
      </DragDropProvider>

      <pre data-name="log">{JSON.stringify(calls)}</pre>
    </div>
  );
}
