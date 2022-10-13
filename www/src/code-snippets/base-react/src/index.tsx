import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '@infinite-table/infinite-react/index.css';

import App from './App';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
