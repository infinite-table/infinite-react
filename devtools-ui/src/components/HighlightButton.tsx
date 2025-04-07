import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';

export function HighlightButton(props: {
  debugId: string;
  children?: React.ReactNode;
}) {
  const { sendMessageToContentScript } = useDevToolsMessagingContext();

  return (
    <button
      className="px-2 py-0 bg-amber-400 text-background cursor-pointer rounded-sm"
      onClick={() => {
        sendMessageToContentScript('highlight', {
          debugId: props.debugId,
        });
      }}
    >
      {props.children ?? 'Show'}
    </button>
  );
}
