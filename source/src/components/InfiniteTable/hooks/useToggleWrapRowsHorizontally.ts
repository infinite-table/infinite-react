import { useEffect } from 'react';
import { usePrevious } from '../../hooks/usePrevious';
import { DEBUG_NAME } from '../InfiniteDebugName';
import { createBrains } from '../state/getInitialState';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

export function useToggleWrapRowsHorizontally() {
  const { state, getState, actions } = useInfiniteTableSelector((ctx) => {
    return {
      state: ctx.state,
      getState: ctx.getState,
      actions: ctx.actions,
    };
  });

  const { wrapRowsHorizontally } = state;
  const oldWrapRowsHorizontally = usePrevious(wrapRowsHorizontally);

  useEffect(() => {
    if (oldWrapRowsHorizontally !== wrapRowsHorizontally) {
      const { brain, headerBrain, renderer, onRenderUpdater } = getState();

      brain.destroy();
      headerBrain.destroy();
      renderer.destroy();
      onRenderUpdater.destroy();

      const newBrains = createBrains(DEBUG_NAME, !!wrapRowsHorizontally);

      actions.brain = newBrains.brain;
      actions.headerBrain = newBrains.headerBrain;

      actions.renderer = newBrains.renderer;
      actions.onRenderUpdater = newBrains.onRenderUpdater;

      actions.headerRenderer = newBrains.headerRenderer;
      actions.headerOnRenderUpdater = newBrains.headerOnRenderUpdater;
    }
  }, [oldWrapRowsHorizontally, wrapRowsHorizontally]);
}
