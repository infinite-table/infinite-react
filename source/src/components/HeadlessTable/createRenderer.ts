import { Renderable } from '../types/Renderable';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { HorizontalLayoutMatrixBrain } from '../VirtualBrain/HorizontalLayoutMatrixBrain';
import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { HorizontalLayoutTableRenderer } from './HorizontalLayoutTableRenderer';
import {
  GridCellAdditionalInfo,
  GridRenderer,
  GridRendererPools,
} from './ReactHeadlessTableRenderer';
import { GridCellPoolForReact } from './GridCellPoolForReact';
import { ListRowPoolForReact } from './ListRowPoolForReact';

/**
 * This is the per-framework composition point for the rendering pipeline:
 * the (shared) renderer + managers get wired to the framework-specific
 * cell/row pools here. Other frameworks will provide a sibling of this file
 * that builds their own pools.
 */
function createPools(debugId: string): GridRendererPools {
  return {
    cellPool: new GridCellPoolForReact<GridCellAdditionalInfo>(debugId),
    rowPool: new ListRowPoolForReact(debugId),
  };
}

export function createRenderer(brain: MatrixBrain) {
  const renderer = !brain.isHorizontalLayoutBrain
    ? new GridRenderer(
        brain,
        `${brain.name}:ReactHeadlessTableRenderer`,
        createPools(`${brain.name}:ReactHeadlessTableRenderer`),
      )
    : new HorizontalLayoutTableRenderer(
        brain as HorizontalLayoutMatrixBrain,
        `${brain.name}:HorizontalLayoutTableRenderer`,
        createPools(`${brain.name}:HorizontalLayoutTableRenderer`),
      );

  const onRenderUpdater = buildSubscriptionCallback<Renderable>();

  brain.onDestroy(() => {
    renderer.destroy();
    onRenderUpdater.destroy();
  });

  if (__DEV__) {
    (brain as any).renderer = renderer;
  }

  return {
    renderer,
    onRenderUpdater,
  };
}
