import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';

export function HighlightButton(props: {
  debugId?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const { sendMessageToHostPage: sendMessageToContentScript } =
    useDevToolsMessagingContext();

  return (
    <button
      className="px-2 py-0 bg-warn text-warn-foreground cursor-pointer rounded-sm"
      onClick={() => {
        const fn = () =>
          sendMessageToContentScript('highlight', {
            debugId: props.debugId,
          });

        (props.onClick || fn)();
      }}
    >
      {props.children ?? 'Show'}
    </button>
  );
}
