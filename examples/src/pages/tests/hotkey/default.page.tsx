import {
  eventToKeyDescriptor,
  keyboardShortcutBinding,
} from '@src/components/utils/hotkey';
import * as React from 'react';

(globalThis as any).combinations = {};

const fn = (e: React.KeyboardEvent) => {
  const key = eventToKeyDescriptor(e);
  console.log(e.key);
  (globalThis as any).combinations[key] =
    (globalThis as any).combinations[key] || 0;
  (globalThis as any).combinations[key]++;
};
function App() {
  React.useEffect(() => {
    const callback = keyboardShortcutBinding(
      [
        'ctrl+shift+i',
        'a',
        'b',
        'c',
        'd',
        'cmd+t',
        'cmd+e',
        'alt+shift+x',
        'shift+alt+y',
        'alt+*',
        'alt+shift+*',
        'escape',
        '*',
      ],
      fn,
    );
    //@ts-ignore
    document.documentElement.addEventListener('keydown', callback);
  }, []);

  return (
    <>
      <input type="text" defaultValue="x" />
    </>
  );
}

export default App;
