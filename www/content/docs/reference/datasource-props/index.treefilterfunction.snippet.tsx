// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { TreeDataSource } from '@infinite-table/infinite-react';

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
} from '@infinite-table/infinite-react';

// the built-in tree filtering: leaf nodes are matched against the column filters,
// a parent node is kept when at least one of its descendants is kept
<TreeDataSource<FileSystemNode>
  primaryKey="id"
  data={data}
  treeFilterFunction={defaultTreeFilterFunction}
/>;

// also keep the parent nodes that match the column filters themselves
<TreeDataSource<FileSystemNode>
  primaryKey="id"
  data={data}
  treeFilterFunction={(param) =>
    param.isLeafNode
      ? defaultFilterFunction(param)
      : defaultFilterFunction(param) || param.filterTreeNode(param.data)
  }
/>;
//#endregion
