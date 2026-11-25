import { Component, computed, signal } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  DataSourcePropMultiRowSelectionTarget,
  InfiniteTableColumn,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
  type: { field: 'type', header: 'Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

const dataSource = () => {
  const nodes: FileSystemNode[] = [
    {
      id: '1',
      name: 'Documents',
      sizeInKB: 1200,
      type: 'folder',
      children: [
        {
          id: '10',
          name: 'Private',
          sizeInKB: 100,
          type: 'folder',
          children: [
            { id: '100', name: 'Report.docx', sizeInKB: 210, type: 'file' },
            { id: '101', name: 'Vacation.docx', sizeInKB: 120, type: 'file' },
            { id: '102', name: 'CV.pdf', sizeInKB: 108, type: 'file' },
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
        { id: '21', name: 'Notes.docx', sizeInKB: 50, type: 'file' },
      ],
    },
  ];
  return Promise.resolve(nodes);
};

@Component({
  selector: 'demo-root',
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source
      (ready)="dataSourceApi = $event"
      nodesKey="children"
      primaryKey="id"
      [data]="dataSource"
      selectionMode="multi-row"
      [multiRowSelectionTarget]="target()"
      [treeFilterFunction]="filter() ? treeFilterFunction() : undefined"
    >
      <div
        style="color: var(--infinite-cell-color); padding: 10px; display: flex; gap: 10px; align-items: center"
      >
        <label>
          multiRowSelectionTarget:
          <select (change)="onTargetChange($event)">
            <option value="all" [selected]="target() === 'all'">all</option>
            <option value="visible" [selected]="target() === 'visible'">
              visible
            </option>
          </select>
        </label>
        <input
          placeholder="Filter files by name"
          [value]="filter()"
          (input)="onFilterInput($event)"
        />
        <button (click)="dataSourceApi!.treeApi.selectAll()">Select all</button>
        <button (click)="dataSourceApi!.treeApi.deselectAll()">
          Deselect all
        </button>
      </div>

      <infinite-tree-grid [columns]="columns" />
    </infinite-tree-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected dataSourceApi: DataSourceApi<FileSystemNode> | null = null;
  protected readonly target =
    signal<DataSourcePropMultiRowSelectionTarget>('visible');
  protected readonly filter = signal('.docx');

  // a new function whenever the filter text changes, so the tree is filtered again
  protected readonly treeFilterFunction = computed(() => {
    const currentFilter = this.filter();

    return ({
      data,
      filterTreeNode,
    }: {
      data: FileSystemNode;
      filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
    }) => {
      if (!Array.isArray(data.children)) {
        return data.name.toLowerCase().includes(currentFilter.toLowerCase());
      }
      return filterTreeNode(data);
    };
  });

  protected onTargetChange(event: Event) {
    this.target.set(
      (event.target as HTMLSelectElement)
        .value as DataSourcePropMultiRowSelectionTarget,
    );
  }

  protected onFilterInput(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
  }
}
