// Code shown on the Angular version of the tree grid "overview" page: the
// sibling of overview.snippet.tsx, with the same `#region` names.
// Type-checked, templates included, by `npm run tsc:angular`.
//
// The regions that are the same code in React and Angular are shown from the
// .tsx file (the fences marked `neutral` in the page).
import { Component } from '@angular/core';

import { TreeDataSource } from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};

declare const dataSource: FileSystemNode[];

@Component({
  selector: 'tree-snippets',
  imports: [TreeDataSource],
  template: `
    <!-- #region using-the-nodeskey-prop-to-specify-where-the -->
    <!-- #highlight -->
    <infinite-tree-data-source nodesKey="children" primaryKey="id" [data]="dataSource" />
    <!-- #endregion -->
  `,
})
export class TreeSnippets {
  protected readonly dataSource = dataSource;
}
