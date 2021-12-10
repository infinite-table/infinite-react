import { useMemo } from 'react';

import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';

import { VirtualBrain } from '../VirtualBrain';
import { ReactVirtualRenderer } from './ReactVirtualRenderer';

function createRenderer(brain: VirtualBrain) {
  const renderer = new ReactVirtualRenderer(brain, {});
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
export function useVirtualRenderer({
  brain,
}: {
  brain: VirtualBrain;
  debugChannel?: string;
}): {
  onRenderUpdater: SubscriptionCallback<Renderable>;
  renderer: ReactVirtualRenderer;
} {
  return useMemo(() => {
    return createRenderer(brain);
  }, [brain]);
}
