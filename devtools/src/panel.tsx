import { createRoot } from 'react-dom/client';
import MainPanel from './components/MainPanel';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<MainPanel />);
