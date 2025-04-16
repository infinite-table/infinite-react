import { useCallback } from 'react';
import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';

export function useHighlight(debugId?: string) {
  const { sendMessageToHostPage: sendMessageToContentScript } =
    useDevToolsMessagingContext();

  const highlight = (id?: string) => {
    sendMessageToContentScript('highlight', { debugId: id ?? debugId });
  };

  return useCallback(highlight, [debugId, sendMessageToContentScript]);
}
