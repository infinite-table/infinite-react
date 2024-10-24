import { Page } from '@testing';

import {
  isNodeTreeLeafNode,
  isNodeTreeNode,
  isNodeTreeParentNode,
  toggleGroupRow,
  toggleRowSelection,
} from '.';
import { ColumnTestingModel } from './ColumnTestingModel';
import { RowTestingModel } from './RowTestingModel';

export class TreeTestingModel {
  static get(page: Page) {
    return new TreeTestingModel(page);
  }

  private page: Page;

  private rowModel: RowTestingModel;

  constructor(page: Page) {
    this.page = page;

    this.rowModel = new RowTestingModel(page);
  }

  async isTreeNode(rowIndex: number) {
    const node = this.rowModel.getCellLocator({
      rowIndex,
      colIndex: 0,
    });

    return await isNodeTreeNode(node);
  }

  async isParentNode(rowIndex: number) {
    const node = this.rowModel.getCellLocator({
      rowIndex,
      colIndex: 0,
    });

    return await isNodeTreeParentNode(node);
  }

  async isLeafNode(rowIndex: number) {
    const node = this.rowModel.getCellLocator({
      rowIndex,
      colIndex: 0,
    });

    return await isNodeTreeLeafNode(node);
  }

  async toggleParentNode(rowIndex: number) {
    await toggleGroupRow({ rowIndex, colIndex: 0 }, { page: this.page });
  }

  async toggleNodeSelection(rowIndex: number) {
    await toggleRowSelection({ rowIndex, colIndex: 0 }, { page: this.page });
  }
}
