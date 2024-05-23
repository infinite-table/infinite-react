---
title: Keyboard Shorcuts
description: Infinite React DataGrid supports user-friendly keyboard shortcuts for executing custom actions.
---

The React DataGrid supports defining keyboard shorcuts in a user-friendly way and attaching custom actions to them.

A keyboard shortcut is defined as an object of the following shape:
  
```ts
{
  key: string;
  when?: (context) => boolean | Promise<boolean>;
  handler: (context, event) => void | Promise<void>;
}
```

The `key` definition is what you're used to from VS Code and other applications - it can be
 * a single character: `t`, `x`, etc...
 * a combination of characters (e.g. `Ctrl+Shift+p`,`Cmd+Shift+Enter`) - key modifiers are supported, and can be added with the `+` (plus) sign.
 * or a special key (e.g. `Enter`, `ArrowUp`, `ArrowDown`, ` `, `Escape`, `Delete`, `Insert`, `PageDown`,`PageUp`,`F1`, `F2`, etc).