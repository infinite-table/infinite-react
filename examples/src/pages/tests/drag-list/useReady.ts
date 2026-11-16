import * as React from 'react';

/**
 * True once the page is mounted, so the handlers of the drag lists are in
 * place. The test pages put it in a `data-ready` attribute: their HTML is
 * rendered on the server, and a spec that starts a drag before the page is
 * hydrated would drag nothing.
 */
export function useReady() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}
