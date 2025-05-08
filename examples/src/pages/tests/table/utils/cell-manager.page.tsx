import { Renderable } from '@src/components/types/Renderable';
import { buildSubscriptionCallback } from '@src/components/utils/buildSubscriptionCallback';
import { GridCellManager } from '@src/components/HeadlessTable/GridCellManager';
import { AvoidReactDiff } from '@src/components/RawList/AvoidReactDiff';
import { useEffect, useState } from 'react';

export default function CellManagerPage() {
  const [cellManager] = useState<GridCellManager<any>>(() => {
    const cellManager = new GridCellManager('test');

    // @ts-ignore
    globalThis.cellManager = cellManager;

    cellManager.onCellAttachmentChange((cell, attached) => {
      console.log('cell status', cell.getElement(), attached);

      const el = cell.getElement();
      if (!el) {
        return;
      }

      if (!attached) {
        el.classList.add('hidden');
      } else {
        el.classList.remove('hidden');
      }
    });

    return cellManager;
  });

  const [updater] = useState(() => {
    const updater = buildSubscriptionCallback<Renderable>(true);
    // @ts-ignore
    globalThis.updater = updater;
    return updater;
  });

  const update = () => {
    let result = cellManager.getAllCells().map((cell) => cell.getNode());

    updater(result);
  };

  // @ts-ignore
  globalThis.update = update;

  useEffect(() => {
    const cell1 = cellManager.getCellFor([0, 0], 'row');

    cellManager.renderNodeAtCell(
      <div
        style={{
          padding: 10,
          margin: 10,
        }}
        ref={cell1.ref}
      >
        cell 0,0
      </div>,
      cell1,
      [0, 0],
    );
    cell1.onMount(() => {
      console.log('cell1 mounted', cell1.getElement());
    });
    const cell2 = cellManager.getCellFor([1, 0], 'row');

    cellManager.renderNodeAtCell(null, cell2, [1, 0]);
    cell2.onMount(() => {
      console.log('cell2 mounted', cell2.getElement());
    });

    update();
  }, []);

  const btnClassName = ' text-white p-2 rounded-md relative active:top-[1px]';
  return (
    <div>
      CellManagerPage
      <AvoidReactDiff updater={updater} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className={`${btnClassName} bg-red-700`}
          onClick={() => {
            // const cell2 = cellManager.getCellAt([1, 0]);
            debugger;
            cellManager.detachCellsStartingAt([1, 0]);

            // debugger;
            // cellManager.renderNodeAtCell(null, cell2!, [1, 0]);

            update();
          }}
        >
          Detach
        </button>
        <button
          className={`${btnClassName} bg-blue-700`}
          onClick={() => {
            const cell2 = cellManager.getCellFor([1, 0], 'row');

            cellManager.renderNodeAtCell(
              <div
                style={{
                  padding: 10,
                  margin: 10,
                }}
                ref={cell2.ref}
              >
                cell 1,0
              </div>,
              cell2,
              [1, 0],
            );

            update();
          }}
        >
          Attach
        </button>
      </div>
    </div>
  );
}
