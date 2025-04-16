import { PlugIcon } from 'lucide-react';
import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';

export function ConnectStatus() {
  const { currentInstance } = useDevToolsMessagingContext();

  const color = currentInstance?.devToolsDetected
    ? 'bg-green-500'
    : 'bg-red-500';
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${color}`}
      >
        {currentInstance?.devToolsDetected ? (
          <PlugIcon className="w-4 h-4" />
        ) : null}
      </div>
    </div>
  );
}
