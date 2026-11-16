import * as React from 'react';
import { createPortal } from 'react-dom';

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

const listStyle: React.CSSProperties = {
  width: 200,
  height: 240,
  background: '#eee',
};

// the proxy is rendered by the page, in the body
const renderDragProxy: DragListProps['renderDragProxy'] = ({
  dragItemId,
  initialRect,
  dx,
  dy,
  ref,
}) => {
  if (!dragItemId) {
    return null;
  }

  return createPortal(
    <div
      ref={ref}
      data-name="rendered-proxy"
      style={{
        position: 'fixed',
        top: initialRect.top + dy,
        left: initialRect.left + dx,
        width: initialRect.width,
        height: initialRect.height,
        background: 'yellow',
        pointerEvents: 'none',
      }}
    >
      dragging {dragItemId}
    </div>,
    document.body,
  );
};

export default function App() {
  const [rendered, setRendered] = React.useState(['a', 'b', 'c']);
  const [customized, setCustomized] = React.useState(['x', 'y', 'z']);
  const [calls, setCalls] = React.useState<LoggedCall[]>([]);

  const log = React.useCallback((call: LoggedCall) => {
    setCalls((calls) => [...calls, call]);
  }, []);

  // the default proxy, changed by the page
  const onDragProxySetup: DragListProps['onDragProxySetup'] = (params) => {
    const { proxyElement, dragItemId } = params;

    log({ name: 'onDragProxySetup', dragItemId });
    proxyElement.setAttribute('data-name', 'customized-proxy');

    return {
      cleanup: ({ proxyElement }) => {
        log({ name: 'cleanup' });
        proxyElement.remove();
      },
    };
  };

  const onDragProxyMove: DragListProps['onDragProxyMove'] = ({
    proxyElement,
    dx,
    dy,
  }) => {
    // moved with margins, not with the default transform
    proxyElement.style.marginLeft = `${dx}px`;
    proxyElement.style.marginTop = `${dy}px`;
    proxyElement.setAttribute('data-moved-by', `${dx},${dy}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <DragDropProvider>
        <div style={{ display: 'flex', gap: 50 }}>
          <DragList
            dragListId="rendered"
            orientation="vertical"
            renderDragProxy={renderDragProxy}
            onDrop={(sortedIndexes) => {
              log({ name: 'rendered.onDrop', sortedIndexes });
              setRendered(sortedIndexes.map((index) => rendered[index]));
            }}
          >
            {(domProps) => (
              <div {...domProps} data-name="rendered" style={listStyle}>
                {rendered.map((id) => (
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
            dragListId="customized"
            orientation="vertical"
            preserveDragSpace
            onDragProxySetup={onDragProxySetup}
            onDragProxyMove={onDragProxyMove}
            onDrop={(sortedIndexes) => {
              log({ name: 'customized.onDrop', sortedIndexes });
              setCustomized(sortedIndexes.map((index) => customized[index]));
            }}
          >
            {(domProps) => (
              <div {...domProps} data-name="customized" style={listStyle}>
                {customized.map((id) => (
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
