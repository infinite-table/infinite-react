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
import {
  GridCellPoolForAngular,
  ListRowPoolForAngular,
  PooledViewHost,
} from './AngularPooledViews.angular';

/**
 * Angular sibling of createRenderer.ts: same shared renderer classes
 * (GridRenderer / HorizontalLayoutTableRenderer), wired to Angular cell/row
 * pools.
 *
 * Shared code (getInitialState) creates the renderers before there is any
 * view, so the pools only get their ViewContainerRef later: the RawTable
 * directive looks the view host up with getPooledViewHost() and binds it.
 */
const VIEW_HOSTS = new WeakMap<GridRenderer, PooledViewHost>();

export function getPooledViewHost(renderer: GridRenderer): PooledViewHost {
  const viewHost = VIEW_HOSTS.get(renderer);
  if (!viewHost) {
    throw new Error(
      `The renderer ${renderer.debugId} was not created by the Angular createRenderer()`,
    );
  }
  return viewHost;
}

function createPools(
  debugId: string,
): GridRendererPools & { viewHost: PooledViewHost } {
  const viewHost = new PooledViewHost(debugId);
  return {
    viewHost,
    cellPool: new GridCellPoolForAngular<GridCellAdditionalInfo>(
      debugId,
      viewHost,
    ),
    rowPool: new ListRowPoolForAngular(debugId, viewHost),
  };
}

export function createRenderer(brain: MatrixBrain) {
  const debugId = !brain.isHorizontalLayoutBrain
    ? `${brain.name}:AngularHeadlessTableRenderer`
    : `${brain.name}:AngularHorizontalLayoutTableRenderer`;

  const pools = createPools(debugId);

  const renderer = !brain.isHorizontalLayoutBrain
    ? new GridRenderer(brain, debugId, pools)
    : new HorizontalLayoutTableRenderer(
        brain as HorizontalLayoutMatrixBrain,
        debugId,
        pools,
      );

  VIEW_HOSTS.set(renderer, pools.viewHost);

  const onRenderUpdater = buildSubscriptionCallback<Renderable>();

  brain.onDestroy(() => {
    renderer.destroy();
    pools.viewHost.destroy();
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
