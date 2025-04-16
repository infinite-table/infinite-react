import { createRoot } from 'react-dom/client';
import { DevToolsUI } from 'devtools-ui';

import ChromeDevToolsProvider from './components/ChromeDevToolsProvider';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <ChromeDevToolsProvider>
    <DevToolsUI />
  </ChromeDevToolsProvider>,
);
