// Snippets shown on keyboard-shortcuts.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type * as React from 'react';
import type { InfiniteTablePropKeyboardShorcut } from '@infinite-table/infinite-react';

//#region predefined-keyboard-shortcuts
import { keyboardShortcuts } from '@infinite-table/infinite-react'
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
    handler: (context: KeyboardShortcutContext, event: React.KeyboardEvent) => void | Promise<void>;
  }
  //#endregion

declare const shortcut: KeyboardShortcut;

// the shape on the page has to be accepted wherever the library takes a shortcut
export const shortcuts: InfiniteTablePropKeyboardShorcut[] = [
  shortcut,
  keyboardShortcuts.instantEdit,
];
