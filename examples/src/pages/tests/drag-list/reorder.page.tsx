import * as React from 'react';

import { DragDropProvider, DragList } from '@infinite-table/infinite-react';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle: React.CSSProperties = {
  height: 40,
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
};

export default function App() {
  const [vertical, setVertical] = React.useState([
    'one',
    'two',
    'three',
    'four',
    'five',
  ]);
  const [horizontal, setHorizontal] = React.useState(['a', 'b', 'c', 'd']);
  const [withHandle, setWithHandle] = React.useState([1, 2, 3]);
  const [log, setLog] = React.useState<LoggedCall[]>([]);

  return (
    <div style={{ padding: 20 }}>
      <DragDropProvider>
        <DragList
          dragListId="vertical"
          orientation="vertical"
          onDrop={(sortedIndexes, options) => {
            setLog((log) => [
              ...log,
              { name: 'vertical.onDrop', sortedIndexes, ...options },
            ]);
            setVertical(sortedIndexes.map((index) => vertical[index]));
          }}
        >
          {(domProps) => (
            <div {...domProps} data-name="vertical" style={{ width: 200 }}>
              {vertical.map((id) => (
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
          dragListId="horizontal"
          orientation="horizontal"
          dragStrategy="inline"
          onDrop={(sortedIndexes, options) => {
            setLog((log) => [
              ...log,
              { name: 'horizontal.onDrop', sortedIndexes, ...options },
            ]);
            setHorizontal(sortedIndexes.map((index) => horizontal[index]));
          }}
        >
          {(domProps) => (
            <div
              {...domProps}
              data-name="horizontal"
              style={{ display: 'flex', width: 320, marginTop: 40 }}
            >
              {horizontal.map((id) => (
                <DragList.DraggableItem key={id} id={id}>
                  {(itemDomProps) => (
                    <div {...itemDomProps} style={{ ...itemStyle, width: 80 }}>
                      {id}
                    </div>
                  )}
                </DragList.DraggableItem>
              ))}
            </div>
          )}
        </DragList>

        <DragList
          dragListId="with-handle"
          orientation="vertical"
          onDrop={(sortedIndexes, options) => {
            setLog((log) => [
              ...log,
              { name: 'with-handle.onDrop', sortedIndexes, ...options },
            ]);
            setWithHandle(sortedIndexes.map((index) => withHandle[index]));
          }}
        >
          {(domProps) => (
            <div
              {...domProps}
              data-name="with-handle"
              style={{ width: 200, marginTop: 40 }}
            >
              {withHandle.map((id) => (
                <DragList.DraggableItem key={id} id={id}>
                  {(itemDomProps) => {
                    // only the handle starts a drag
                    const { onPointerDown, ...rest } = itemDomProps;

                    return (
                      <div
                        {...rest}
                        style={{ ...itemStyle, display: 'flex', gap: 10 }}
                      >
                        <span
                          data-name="handle"
                          onPointerDown={onPointerDown}
                          style={{ width: 30, background: 'silver' }}
                        />
                        <span data-name="label">item {id}</span>
                      </div>
                    );
                  }}
                </DragList.DraggableItem>
              ))}
            </div>
          )}
        </DragList>
      </DragDropProvider>

      <pre data-name="log">{JSON.stringify(log)}</pre>
    </div>
  );
}
