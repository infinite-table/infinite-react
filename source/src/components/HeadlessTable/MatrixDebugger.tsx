import * as React from 'react';
import { useEffect, useRef } from 'react';
import { InfiniteTableState } from '../InfiniteTable/types';
import { useRerender } from '../hooks/useRerender';
import { debounce } from '../utils/debounce';
import { createPortal } from 'react-dom';

type MatrixDebuggerProps = {
  debugTarget: string;
};

export function INTERNAL_MatrixDebugger(props: MatrixDebuggerProps) {
  const [getState, setGetState] = React.useState<
    null | (() => InfiniteTableState<any>)
  >(null);

  useEffect(() => {
    const { debugTarget } = props;

    const intervalId = setInterval(() => {
      if (
        (globalThis as any).INFINITE &&
        (globalThis as any).INFINITE[debugTarget]
      ) {
        const getState = (globalThis as any).INFINITE[debugTarget].getState;

        clearInterval(intervalId);

        setGetState(() => getState);
      }
    }, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, [props.debugTarget]);

  return typeof getState === 'function' ? (
    <MatrixDebuggerContext.Provider value={{ getState }}>
      <MatrixDebuggerUI />
    </MatrixDebuggerContext.Provider>
  ) : null;
}
const MatrixDebuggerContext = React.createContext<{
  getState: () => InfiniteTableState<any>;
}>({
  getState: () => null as any as InfiniteTableState<any>,
});

function MatrixDebuggerUI() {
  const contextValue = React.useContext(MatrixDebuggerContext);
  const { getState } = contextValue;

  const [, rerender] = useRerender();

  const cellManager = getState().renderer.cellManager;

  useEffect(() => {
    const delayedRerender = debounce(
      () => {
        console.log('rerender');
        rerender();
      },
      { wait: 500 },
    );
    return cellManager.onCellAttachmentChange(delayedRerender);
  }, [cellManager, rerender]);

  const rowIndexes: number[] = cellManager.getRowsWithCells();
  const columnsIndexes: number[] = cellManager.getColumnsWithCells();

  const domRef = useRef<HTMLDivElement>(null);
  const displayTimeoutRef = useRef<any | null>(null);

  return (
    <div style={{ overflow: 'auto' }}>
      {createPortal(
        <div
          ref={domRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '0px',
            height: '0px',
            pointerEvents: 'none',
            background: 'rgba(255, 0, 0, 0.5)',
            opacity: '0',
          }}
        />,
        document.body,
      )}
      <table
        style={{
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {columnsIndexes.map((columnIndex) => {
              return (
                <th key={columnIndex} data-col-index={columnIndex}>
                  {columnIndex}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rowIndexes.map((rowIndex) => {
            return (
              <tr key={rowIndex} data-row-index={rowIndex}>
                {columnsIndexes.map((columnIndex) => {
                  return (
                    <td
                      key={columnIndex}
                      style={{
                        padding: 5,
                        border: '1px solid gray',
                        background: cellManager
                          .getCellAt([rowIndex, columnIndex])
                          ?.getNode()
                          ? 'rgba(0, 255, 0, 0.3)' // with 0.3 opacity
                          : 'rgba(255, 0, 0, 0.3)', // with 0.3 opacity
                      }}
                      data-col-index={columnIndex}
                    >
                      <button
                        onClick={() => {
                          const el = cellManager
                            .getCellAt([rowIndex, columnIndex])
                            ?.getElement();

                          if (!el) {
                            return;
                          }

                          const rect = el.getBoundingClientRect();

                          domRef.current!.style.top = `${rect.top}px`;
                          domRef.current!.style.left = `${rect.left}px`;
                          domRef.current!.style.width = `${rect.width}px`;
                          domRef.current!.style.height = `${rect.height}px`;
                          domRef.current!.style.opacity = '0.5';
                          domRef.current!.style.transition = 'opacity 0.5s';

                          if (displayTimeoutRef.current) {
                            clearTimeout(displayTimeoutRef.current);
                          }

                          displayTimeoutRef.current = setTimeout(() => {
                            domRef.current!.style.opacity = '0';
                            displayTimeoutRef.current = null;
                          }, 2000);

                          console.log(el);
                        }}
                        style={{
                          cursor: 'pointer',
                        }}
                      >
                        {/* {cellManager.getCellFor([rowIndex, columnIndex], optimizeFor).} */}
                        ({rowIndex},{columnIndex})
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
