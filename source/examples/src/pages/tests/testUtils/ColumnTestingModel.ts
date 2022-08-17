import { Page } from '@playwright/test';
import {
  getColumnWidths,
  getHeaderCellByColumnId,
  getHeaderColumnCells,
  getSelectedRowIds,
} from '.';

export class ColumnTestingModel {
  static get(page: Page) {
    return new ColumnTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getColumnWidths(colIds?: string[]) {
    if (!colIds) {
      colIds = await this.getVisibleColumnIds();
    }
    const widths = await getColumnWidths(colIds, { page: this.page });

    return {
      list: widths,
      map: colIds.reduce((map, colId, index) => {
        map[colId] = widths[index];
        return map;
      }, {} as Record<string, number>),
    };
  }

  async getVisibleColumnIds() {
    const cells = await getHeaderColumnCells({ page: this.page });

    const colIds = (await Promise.all(
      cells.map(async (cell) => {
        return cell.evaluate((node) => node.dataset.columnId);
      }),
    )) as string[];

    return colIds;
  }

  async getSelectedRowIdsForVisibleRows() {
    return await getSelectedRowIds({ page: this.page });
  }

  async isColumnDisplayed(colId: string) {
    const visibleIds = await this.getVisibleColumnIds();

    return !!visibleIds.filter((id) => id === colId)[0];
  }

  async moveColumn(colId: string, leftOrRight: number) {
    const headerCell = await getHeaderCellByColumnId(colId, {
      page: this.page,
    }).elementHandle();

    const box = (await headerCell!.boundingBox())!;
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width / 2 + leftOrRight, 0);
    await this.page.mouse.up();
  }
}
