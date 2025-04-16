import { Renderable } from '../types/Renderable';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { HorizontalLayoutMatrixBrain } from '../VirtualBrain/HorizontalLayoutMatrixBrain';
import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { HorizontalLayoutTableRenderer } from './HorizontalLayoutTableRenderer';
import { GridRenderer } from './ReactHeadlessTableRenderer';

export function createRenderer(brain: MatrixBrain) {
  const renderer = !brain.isHorizontalLayoutBrain
    ? new GridRenderer(brain, `${brain.name}:ReactHeadlessTableRenderer`)
    : new HorizontalLayoutTableRenderer(
        brain as HorizontalLayoutMatrixBrain,
        `${brain.name}:HorizontalLayoutTableRenderer`,
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
