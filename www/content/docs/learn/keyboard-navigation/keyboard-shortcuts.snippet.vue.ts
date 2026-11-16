// Snippets shown on the Vue version of keyboard-shortcuts.page.md: the sibling of
// keyboard-shortcuts.snippet.tsx, with the same `#region` names.
// Type-checked with vue-tsc against the library source (`npm run tsc:vue`).
import type { InfiniteTablePropKeyboardShorcut } from '@infinite-table/infinite-vue';

//#region predefined-keyboard-shortcuts
import { keyboardShortcuts } from '@infinite-table/infinite-vue'
//#endregion

// What the `when` and `handler` functions of a keyboard shortcut are called with.
// The library has no public name for it, so the page uses this one.
type KeyboardShortcutContext = Parameters<
  InfiniteTablePropKeyboardShorcut['handler']
>[0];

// The shape of a keyboard shortcut, as the page describes it. It is narrower than
// the library type (which also takes an array of keys, and more handler results).
type KeyboardShortcut =
  //#region intro
  {
    key: string;
    when?: (context: KeyboardShortcutContext) => boolean | Promise<boolean>;
    handler: (context: KeyboardShortcutContext, event: KeyboardEvent) => void | Promise<void>;
  }
  //#endregion

declare const shortcut: KeyboardShortcut;

// the shape on the page has to be accepted wherever the library takes a shortcut
export const shortcuts: InfiniteTablePropKeyboardShorcut[] = [
  shortcut,
  keyboardShortcuts.instantEdit,
];
