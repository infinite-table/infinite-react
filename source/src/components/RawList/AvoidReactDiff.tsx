import * as React from 'react';
import { flushSync } from 'react-dom';
import { useLayoutEffect, useRef, useState } from 'react';

import type { Renderable } from '../types/Renderable';
import type { SubscriptionCallback } from '../types/SubscriptionCallback';

export type AvoidReactDiffProps = {
  name?: string;
  useraf?: boolean;
  updater: SubscriptionCallback<Renderable>;
  shouldFlushSync?: () => boolean;
};

const SHOULD_FLUSH_SYNC = () => false;

function AvoidReactDiffFn(props: AvoidReactDiffProps) {
  const [children, setChildren] = useState<Renderable>(props.updater.get);

  const rafId = useRef<any>(null);

  // const shouldFlushSync = SHOULD_FLUSH_SYNC;
  const shouldFlushSync = props.shouldFlushSync ?? SHOULD_FLUSH_SYNC;

  // prev react 19 we had useEffect here
  // but there are situations when the updater would be called
  // after initial render and before useEffect triggered
  // which would cause the component to not re-render
  // so we use useLayoutEffect here to ensure we pick up those changes
  useLayoutEffect(() => {
    function onChange(children: Renderable) {
      // so when updater triggers a change
      // we can re-render and set the children

      let FLUSH_SYNC = shouldFlushSync();

      if (props.useraf) {
        if (rafId.current != null) {
          cancelAnimationFrame(rafId.current);
        }
        rafId.current = requestAnimationFrame(() => {
          if (FLUSH_SYNC) {
            queueMicrotask(() => {
              flushSync(() => {
                setChildren(children);
              });
            });
          } else {
            setChildren(children);
          }
        });
      } else {
        if (FLUSH_SYNC) {
          queueMicrotask(() => {
            flushSync(() => {
              setChildren(children);
            });
          });
        } else {
          setChildren(children);
        }
      }
    }
    const remove = props.updater.onChange(onChange);

    return () => {
      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current);
      }
      remove();
    };
  }, [props.updater, props.useraf, shouldFlushSync]);

  return (children as React.ReactNode) ?? null;
}

//@ts-ignore
export const AvoidReactDiff = React.memo(AvoidReactDiffFn);
