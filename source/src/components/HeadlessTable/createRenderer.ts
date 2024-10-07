import { Renderable } from '../types/Renderable';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { HorizontalLayoutMatrixBrain } from '../VirtualBrain/HorizontalLayoutMatrixBrain';
import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { HorizontalLayoutTableRenderer } from './HorizontalLayoutTableRenderer';
import { ReactHeadlessTableRenderer } from './ReactHeadlessTableRenderer';

export function createRenderer(brain: MatrixBrain) {
  const renderer = !brain.isHorizontalLayoutBrain
    ? new ReactHeadlessTableRenderer(
        brain,
        `ReactHeadlessTableRenderer:${brain.name}`,
      )
    : new HorizontalLayoutTableRenderer(
        brain as HorizontalLayoutMatrixBrain,
        `HorizontalLayoutTableRenderer:${brain.name}`,
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
