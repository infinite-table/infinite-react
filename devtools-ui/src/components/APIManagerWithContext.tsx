import { useCallback, useState } from 'react';
import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';
import type {
  DevToolsOverrides,
  ErrorCodeKey,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-react';
import { APIManagerContext } from '../lib/APIManagerContext';

export const APIManagerWithContext = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    activeDebugId,
    sendMessageToHostPage: sendMessageToContentScript,
    currentInstance,
  } = useDevToolsMessagingContext();
  const [renderKey, setRenderKey] = useState(0);
  const rerender = useCallback(() => {
    setRenderKey((prev) => prev + 1);
  }, []);

  const [overridenProperties] = useState<Set<keyof DevToolsOverrides>>(() => {
    return new Set();
  });

  const sendMessage = useCallback(
    (
      options: {
        type: string;
        property?: keyof DevToolsOverrides;
      },
      payload: any,
    ) => {
      const { type, property } = options;

      sendMessageToContentScript(type, {
        ...payload,
        debugId: activeDebugId,
        property,
      });

      if (!property || type === 'revertProperty' || type === 'revertAll') {
        return;
      }
      overridenProperties.add(property as keyof DevToolsOverrides);
      rerender();
    },
    [activeDebugId, sendMessageToContentScript],
  );

  const revertProperty = useCallback(
    (property: keyof DevToolsOverrides) => {
      overridenProperties.delete(property);
      sendMessage(
        { type: 'revertProperty', property },
        {
          property,
          debugId: activeDebugId,
        },
      );
      rerender();
    },
    [activeDebugId, sendMessage],
  );

  const revertAll = useCallback(() => {
    overridenProperties.clear();
    sendMessage(
      { type: 'revertAll' },
      {
        debugId: activeDebugId,
      },
    );
    rerender();
  }, [activeDebugId, sendMessage]);

  const setColumnVisibility = useCallback(
    (columnVisibility: InfiniteTablePropColumnVisibility) => {
      sendMessage(
        { type: 'setColumnVisibility', property: 'columnVisibility' },
        {
          columnVisibility,
          debugId: activeDebugId,
        },
      );
    },
    [activeDebugId, sendMessage],
  );

  const discardWarning = useCallback(
    (warning: ErrorCodeKey) => {
      sendMessage(
        { type: 'discardWarning' },
        {
          warning,
          debugId: activeDebugId,
        },
      );
    },
    [activeDebugId, sendMessage],
  );

  const discardAllWarnings = useCallback(() => {
    sendMessage(
      { type: 'discardAllWarnings' },
      {
        debugId: activeDebugId,
      },
    );
  }, [activeDebugId, sendMessage]);

  const setGroupBy = useCallback(
    (groupBy: { field: string }[]) => {
      sendMessage(
        { type: 'setGroupBy', property: 'groupBy' },
        {
          groupBy,
          debugId: activeDebugId,
        },
      );
    },
    [activeDebugId, sendMessage],
  );

  const setGroupRenderStrategy = useCallback(
    (groupRenderStrategy: string) => {
      sendMessage(
        { type: 'setGroupRenderStrategy', property: 'groupRenderStrategy' },
        {
          groupRenderStrategy,
          debugId: activeDebugId,
        },
      );
    },
    [activeDebugId, sendMessage],
  );

  const setSortInfo = useCallback(
    (sortInfo: { field: string; dir: 1 | -1 }[]) => {
      sendMessage(
        { type: 'setSortInfo', property: 'sortInfo' },
        { sortInfo, debugId: activeDebugId },
      );
    },
    [activeDebugId, sendMessage],
  );

  const setMultiSort = useCallback(
    (multiSort: boolean) => {
      sendMessage(
        { type: 'setMultiSort', property: 'multiSort' },
        { multiSort, debugId: activeDebugId },
      );
    },
    [activeDebugId, sendMessage],
  );

  return (
    <APIManagerContext.Provider
      value={{
        discardWarning,
        discardAllWarnings,
        warnings: currentInstance?.debugWarnings || {},
        setColumnVisibility,
        setGroupBy,
        setGroupRenderStrategy,
        setSortInfo,
        setMultiSort,
        revertProperty,
        revertAll,
        rerender,
        overridenProperties,
      }}
    >
      {children}
    </APIManagerContext.Provider>
  );
};
