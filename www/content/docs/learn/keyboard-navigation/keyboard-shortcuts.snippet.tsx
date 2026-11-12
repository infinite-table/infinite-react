// Snippets shown on keyboard-shortcuts.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

{
  //#region intro
  {
    key: string;
    when?: (context) => boolean | Promise<boolean>;
    handler: (context, event) => void | Promise<void>;
  }
  //#endregion
}

//#region predefined-keyboard-shortcuts
import { keyboardShortcuts } from '@infinite-table/infinite-react'
//#endregion

export {};
