import { Component, computed, signal } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropOnTreeSelectionChange_MultiNode,
  InfiniteTableColumn,
  InfiniteTablePropMultiRowSelectionWith,
  TreeExpandStateValue,
  TreeSelectionValue,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeInKB: number;
  children?: FileSystemNode[];
};

const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [],
};

const defaultTreeExpandState: TreeExpandStateValue = {
  defaultExpanded: true,
  collapsedPaths: [['1', '10']],
};

const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    sizeInKB: 1200,
    type: 'folder',
    children: [
      { id: '11', name: 'Report.docx', sizeInKB: 210, type: 'file' },
      {
        id: '10',
        name: 'Private',
        sizeInKB: 100,
        type: 'folder',
        children: [
          { id: '100', name: 'Vacation.docx', sizeInKB: 120, type: 'file' },
          { id: '101', name: 'CV.pdf', sizeInKB: 108, type: 'file' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    sizeInKB: 1000,
    type: 'folder',
    children: [
      { id: '20', name: 'unknown.txt', sizeInKB: 100, type: 'file' },
      { id: '21', name: 'notes.txt', sizeInKB: 20, type: 'file' },
    ],
  },
  {
    id: '3',
    name: 'Media',
    sizeInKB: 1000,
    type: 'folder',
    children: [
      {
        id: '31',
        name: 'Videos',
        sizeInKB: 5400,
        type: 'folder',
        children: [
          { id: '310', name: 'Vacation.mp4', sizeInKB: 108, type: 'file' },
        ],
      },
    ],
  },
];

const names: Record<string, string> = {};
const collectNames = (list: FileSystemNode[]) =>
  list.forEach((node) => {
    names[node.id] = node.name;
    if (node.children) {
      collectNames(node.children);
    }
  });
collectNames(nodes);

@Component({
  selector: 'demo-root',
  imports: [TreeDataSource, TreeGrid],
  template: `
    <div
      style="color: var(--infinite-cell-color); padding: 10px; display: flex; flex-wrap: wrap; gap: 10px"
    >
      <button (click)="checkbox.set(!checkbox())">
        {{ checkbox() ? 'Hide' : 'Show' }} selection checkboxes
      </button>
      <button
        (click)="selectWith.set(selectWith() === 'click' ? 'checkbox' : 'click')"
      >
        multiRowSelectionWith: {{ selectWith() }}
      </button>
    </div>
    <div style="color: var(--infinite-cell-color); padding: 10px">
      Selected files: {{ selectedFiles().join(', ') || 'none' }}
    </div>
    <infinite-tree-data-source
      nodesKey="children"
      primaryKey="id"
      [data]="nodes"
      selectionMode="multi-row"
      [defaultTreeExpandState]="defaultTreeExpandState"
      [defaultTreeSelection]="defaultTreeSelection"
      [onTreeSelectionChange]="onTreeSelectionChange"
    >
      <infinite-tree-grid
        [columns]="columns()"
        [multiRowSelectionWith]="selectWith()"
      />
    </infinite-tree-data-source>
  `,
})
export default class App {
  protected readonly nodes = nodes;
  protected readonly defaultTreeExpandState = defaultTreeExpandState;
  protected readonly defaultTreeSelection = defaultTreeSelection;

  protected readonly checkbox = signal(false);
  protected readonly selectWith =
    signal<InfiniteTablePropMultiRowSelectionWith>('checkbox');
  protected readonly selectedFiles = signal<string[]>([]);

  protected readonly columns = computed<
    Record<string, InfiniteTableColumn<FileSystemNode>>
  >(() => ({
    name: {
      field: 'name',
      header: 'Name',
      renderTreeIcon: true,
      renderSelectionCheckBox: this.checkbox(),
    },
    type: { field: 'type', header: 'Type' },
    size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
  }));

  // a function input: it also gets the selection state, as the second argument
  protected readonly onTreeSelectionChange: DataSourcePropOnTreeSelectionChange_MultiNode<FileSystemNode> =
    (_selection, { treeSelectionState }) => {
      this.selectedFiles.set(
        treeSelectionState
          .getSelectedLeafNodePaths()
          .map((path) => names[path[path.length - 1]]),
      );
    };
}
