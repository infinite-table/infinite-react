// Code shown on the Angular version of tree-icon-rendering.page.md: the
// sibling of tree-icon-rendering.snippet.tsx, with the same `#region` names.
// Type-checked, templates included, by `npm run tsc:angular`.
//
// The regions that are the same code in React and Angular are shown from the
// .tsx file (the fences marked `neutral` in the page).
import { Component, input, output } from '@angular/core';

import {
  renderComponent,
  type InfiniteTableColumn,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

@Component({
  selector: 'file-icon',
  template: `📄`,
})
class FileIcon {}

@Component({
  selector: 'folder-icon',
  template: `<span (click)="toggle.emit()">{{ open() ? '📂' : '📁' }}</span>`,
})
class FolderIcon {
  readonly open = input(false);
  readonly toggle = output<void>();
}

export function parentNodeCheck() {
  //#region checking-if-the-node-is-a-parent-node
  const renderTreeIcon: InfiniteTableColumn<FileSystemNode>['renderTreeIcon'] =
    ({ rowInfo, toggleCurrentTreeNode }) => {
      if (!rowInfo.isParentNode) {
        // rowInfo.nodeExpanded not available here
        return renderComponent(FileIcon);
      }

      // it's now OK for TS to use rowInfo.nodeExpanded
      return renderComponent(FolderIcon, {
        inputs: { open: rowInfo.nodeExpanded },
        outputs: { toggle: toggleCurrentTreeNode },
      });
    };
  //#endregion
  return renderTreeIcon;
}
