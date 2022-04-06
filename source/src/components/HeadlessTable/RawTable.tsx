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
  brain: MatrixBrain;
  renderCell: TableRenderCellFn;
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
    const renderRange = brain.getRenderRange();
    const extraCells = brain.getExtraCells();

    renderer.renderRange(renderRange, extraCells, {
      onRender: onRenderUpdater,
      force: true,
      renderCell,
    });
  }, [renderer, brain, renderCell, onRenderUpdater]);

  // (globalThis as any).brain = brain;
  // (globalThis as any).renderer = renderer;

  useEffect(() => {
    const remove = brain.onRenderRangeChange((renderRange, extraCells) => {
      renderer.renderRange(renderRange, extraCells, {
        force: false,
        onRender: onRenderUpdater,
        renderCell,
      });
    });

    return remove;
  }, []);

  return <AvoidReactDiff updater={onRenderUpdater} />;
}

export const RawTable: React.FC<RawTableProps> = React.memo(RawTableFn);
