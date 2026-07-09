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
import { GridCellPoolForVue } from './GridCellPoolForVue.vue';
import { ListRowPoolForVue } from './ListRowPoolForVue.vue';

/**
 * Vue sibling of createRenderer.ts: same shared renderer classes
 * (GridRenderer / HorizontalLayoutTableRenderer), wired to Vue cell/row pools.
 */
function createPools(debugId: string): GridRendererPools {
  return {
    cellPool: new GridCellPoolForVue<GridCellAdditionalInfo>(debugId),
    rowPool: new ListRowPoolForVue(debugId),
  };
}

export function createRenderer(brain: MatrixBrain) {
  const renderer = !brain.isHorizontalLayoutBrain
    ? new GridRenderer(
        brain,
        `${brain.name}:VueHeadlessTableRenderer`,
        createPools(`${brain.name}:VueHeadlessTableRenderer`),
      )
    : new HorizontalLayoutTableRenderer(
        brain as HorizontalLayoutMatrixBrain,
        `${brain.name}:VueHorizontalLayoutTableRenderer`,
        createPools(`${brain.name}:VueHorizontalLayoutTableRenderer`),
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
