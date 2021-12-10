import { useMemo } from 'react';

import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';

import { VirtualBrain } from '../VirtualBrain';
import { ReactVirtualRenderer } from './ReactVirtualRenderer';

// this was needed for React.StrictMode, so we keep the same renderer
// for the same brain instance, as in strict mode, hooks are called twice
// and strict mode behaves differently in various versions of React
// TODO for future: check if still needed
function createRenderer(brain: VirtualBrain) {
  // @ts-ignore
  if (brain.__rendererResult) {
    // @ts-ignore
    return brain.__rendererResult;
  }
  const renderer = new ReactVirtualRenderer(brain, {});
  const onRenderUpdater = buildSubscriptionCallback<Renderable>();

  brain.onDestroy(() => {
    // @ts-ignore
    delete brain.__rendererResult;
    renderer.destroy();
    onRenderUpdater.destroy();
  });

  const result = {
    renderer,
    onRenderUpdater,
  };

  // @ts-ignore
  brain.__rendererResult = result;

  return result;
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
