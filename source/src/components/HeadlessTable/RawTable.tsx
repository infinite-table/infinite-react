import * as React from 'react';
import { useEffect, useMemo } from 'react';

import { AvoidReactDiff } from '../RawList/AvoidReactDiff';
import { Renderable } from '../types/Renderable';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { MatrixBrain } from '../VirtualBrain/MatrixBrain';

import {
  ReactHeadlessTableRenderer,
  TableRenderCellFn,
} from './ReactHeadlessTableRenderer';

export type RawTableProps = {
  name?: string;
  brain: MatrixBrain;
  renderCell: TableRenderCellFn;
  cellHoverClassNames?: string[];
};

function createRenderer(brain: MatrixBrain) {
  const renderer = new ReactHeadlessTableRenderer(brain);
  const onRenderUpdater = buildSubscriptionCallback<Renderable>();

  brain.onDestroy(() => {
    renderer.destroy();
    onRenderUpdater.destroy();
  });

  return {
    renderer,
    onRenderUpdater,
  };
}
export function RawTableFn(props: RawTableProps) {
  const { brain, renderCell } = props;

  const { renderer, onRenderUpdater } = useMemo(() => {
    return createRenderer(brain);
  }, [brain]);

  useEffect(() => {
    renderer.cellHoverClassNames = props.cellHoverClassNames || [];
  }, [renderer, props.cellHoverClassNames]);

  useEffect(() => {
    const renderRange = brain.getRenderRange();

    renderer.renderRange(renderRange, {
      onRender: onRenderUpdater,
      force: true,
      renderCell,
    });
  }, [renderer, brain, renderCell, onRenderUpdater]);

  useEffect(() => {
    const remove = brain.onRenderRangeChange((renderRange) => {
      renderer.renderRange(renderRange, {
        force: false, // TODO should be false
        onRender: (items) => {
          const currentItems = onRenderUpdater.get();
          if (
            currentItems &&
            items &&
            (currentItems as any).length === items.length
          ) {
            // dont update, as each item in turn
            // is an AvoidReactDiff component
            // which is updating itself
            return;
          }
          onRenderUpdater(items);
        },
        renderCell,
      });
    });

    return remove;
  }, [renderCell]);

  return <AvoidReactDiff updater={onRenderUpdater} />;
}

export const RawTable: React.FC<RawTableProps> = React.memo(RawTableFn);
