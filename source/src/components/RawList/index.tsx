import * as React from 'react';
import { useMemo, useEffect } from 'react';

import { buildUpdater, ReactVirtualRenderer } from './ReactVirtualRenderer';
import { AvoidReactDiff } from './AvoidReactDiff';
import { RawListProps } from './types';
import { useLatest } from '../hooks/useLatest';

function RawListFn(props: RawListProps) {
  const { renderItem, brain, debugChannel } = props;

  const { updater, renderer } = useMemo(() => {
    const updater = buildUpdater();
    const renderer = new ReactVirtualRenderer(brain, {
      onRender: updater,
      channel: debugChannel,
    });

    return { updater, renderer };
  }, []);

  const getRenderItem = useLatest(renderItem);

  useEffect(() => {
    const renderRange = brain.getRenderRange();

    renderer.renderRange(renderRange, {
      renderItem,
      force: true,
    });
  }, [renderItem]);

  useEffect(() => {
    const remove = brain.onRenderRangeChange((renderRange) => {
      renderer.renderRange(renderRange, {
        force: false,
        renderItem: getRenderItem(),
      });
    });
    return remove;
  }, [brain]);

  useEffect(() => {
    return () => {
      renderer.destroy();
      updater.destroy();
    };
  }, [renderer]);

  return <AvoidReactDiff updater={updater} />;
}

export const RawList: React.FC<RawListProps> = React.memo(RawListFn);
