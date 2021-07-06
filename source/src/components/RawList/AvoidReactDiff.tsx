import React, { useLayoutEffect, useState } from 'react';

import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';

export type AvoidReactDiffProps = {
  name?: string;
  updater: SubscriptionCallback<Renderable>;
};

function AvoidReactDiffFn(props: AvoidReactDiffProps) {
  const [children, setChildren] = useState<Renderable>(props.updater.get());

  useLayoutEffect(() => {
    // register to updater changes
    const remove = props.updater.onChange((children) => {
      // so when updater triggers a change
      // we can re-render and set the children

      setChildren(children);
    });

    return remove;
  }, [props.updater]);

  return <>{children}</>;
}

export const AvoidReactDiff = React.memo(AvoidReactDiffFn);
