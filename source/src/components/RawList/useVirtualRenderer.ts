import { useMemo } from 'react';

import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';

import { VirtualBrain } from '../VirtualBrain';
import { ReactVirtualRenderer } from './ReactVirtualRenderer';

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
    return brain.createRenderer();
  }, [brain]);
}
