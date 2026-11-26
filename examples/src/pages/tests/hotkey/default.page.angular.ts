import { Component, afterNextRender } from '@angular/core';

import {
  eventToKeyDescriptor,
  keyboardShortcutBinding,
} from '@src/components/utils/hotkey';

(globalThis as any).combinations = {};

const fn = (e: KeyboardEvent) => {
  const key = eventToKeyDescriptor(e as any);
  console.log(e.key);
  (globalThis as any).combinations[key] =
    (globalThis as any).combinations[key] || 0;
  (globalThis as any).combinations[key]++;
};

@Component({
  template: `<input type="text" value="x" />`,
})
export default class HotkeyDefaultPage {
  constructor() {
    afterNextRender(() => {
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
        fn as any,
      );
      //@ts-ignore
      document.documentElement.addEventListener('keydown', callback);
      (globalThis as any).hotkeyReady = true;
    });
  }
}
