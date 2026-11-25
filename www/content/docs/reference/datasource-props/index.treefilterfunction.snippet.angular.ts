// Code shown on the Angular version of index.page.md: the sibling of
// index.treefilterfunction.snippet.tsx, with the same `#region` name.
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';
import { TreeDataSource } from '@infinite-table/infinite-angular';
import type { DataSourcePropTreeFilterFunction } from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};

declare const data: FileSystemNode[];

//#region treefilterfunction
import {
  defaultFilterFunction,
  defaultTreeFilterFunction,
} from '@infinite-table/infinite-angular';

// the built-in tree filtering: leaf nodes are matched against the column filters,
// a parent node is kept when at least one of its descendants is kept
// <infinite-tree-data-source [treeFilterFunction]="defaultTreeFilterFunction" />

// also keep the parent nodes that match the column filters themselves
const treeFilterFunction: DataSourcePropTreeFilterFunction<FileSystemNode> = (
  param,
) =>
  param.isLeafNode
    ? defaultFilterFunction(param)
    : defaultFilterFunction(param) || param.filterTreeNode(param.data);
// <infinite-tree-data-source [treeFilterFunction]="treeFilterFunction" />
//#endregion

@Component({
  selector: 'tree-filter-function-snippet',
  imports: [TreeDataSource],
  template: `
    <infinite-tree-data-source
      primaryKey="id"
      [data]="data"
      [treeFilterFunction]="defaultTreeFilterFunction"
    />
    <infinite-tree-data-source
      primaryKey="id"
      [data]="data"
      [treeFilterFunction]="treeFilterFunction"
    />
  `,
})
export class TreeFilterFunctionSnippet {
  protected readonly data = data;
  protected readonly defaultTreeFilterFunction = defaultTreeFilterFunction;
  protected readonly treeFilterFunction = treeFilterFunction;
}
