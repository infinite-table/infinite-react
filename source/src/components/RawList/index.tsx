import * as React from 'react';
import { useEffect } from 'react';

import { AvoidReactDiff } from './AvoidReactDiff';
import { RawListProps } from './types';
import { useLatest } from '../hooks/useLatest';
import { useVirtualRenderer } from './useVirtualRenderer';

function RawListFn(props: RawListProps) {
  const { renderItem, brain, debugChannel } = props;

  const { onRenderUpdater, renderer } = useVirtualRenderer({
    brain,
    debugChannel,
  });
  const getRenderItem = useLatest(renderItem);

  useEffect(() => {
    const renderRange = brain.getRenderRange();

    renderer.renderRange(renderRange, {
      renderItem,
      force: true,
      onRender: onRenderUpdater,
    });
  }, [brain, renderItem, onRenderUpdater]);

  useEffect(() => {
    const remove = brain.onRenderRangeChange((renderRange) => {
      renderer.renderRange(renderRange, {
        force: false,
        renderItem: getRenderItem(),
        onRender: onRenderUpdater,
      });
    });
    return remove;
  }, [brain, onRenderUpdater]);

  return <AvoidReactDiff updater={onRenderUpdater} />;
}

export const RawList: React.FC<RawListProps> = React.memo(RawListFn);
