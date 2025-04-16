import { DevToolsUI } from 'devtools-ui';
import BrowserDevToolsProvider from 'devtools-ui/components/BrowserDevToolsProvider';

export function Template() {
  return (
    <div className="flex flex-col p-2 bg-background flex-container min-h-[50vh]">
      <div style={{ flex: 'none' }} className="text-lg font-bold mb-2">
        Devtools
      </div>
      <BrowserDevToolsProvider>
        <DevToolsUI />
      </BrowserDevToolsProvider>
    </div>
  );
}
