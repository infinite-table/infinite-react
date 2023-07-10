import { Page } from '@playwright/test';
import {
  CellLocation,
  ColLocation,
  getCellNodeLocator,
  getColumnGroupsIds,
  getColumnGroupsLabels,
  getColumnWidths,
  getHeaderCellForColumn,
  getHeaderColumnCells,
  getSelectedRowIds,
  resizeHandle,
} from '.';
import { HeaderTestingModel } from './HeaderTestingModel';
import { kebabCase } from './kebabCase';

export class ColumnTestingModel {
  static get(page: Page) {
    return new ColumnTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  resizeColumn = async (colLocation: ColLocation, diff: number) => {
    const headerModel = new HeaderTestingModel(this.page);
    const colHeaderCell = headerModel.getHeaderCellLocator(colLocation);

    const handle = await colHeaderCell.locator(
      '.InfiniteHeaderCell_ResizeHandle',
    );

    await resizeHandle(diff, handle, this.page);
  };

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

  getCellLocator(cellLocation: CellLocation) {
    return getCellNodeLocator(cellLocation, { page: this.page });
  }

  async getCellComputedStyleProperty(
    cellLocation: CellLocation,
    styleName: string,
  ) {
    const cell = this.getCellLocator(cellLocation);

    return cell.evaluate((node, propertyName) => {
      const style = window
        .getComputedStyle(node)
        .getPropertyValue(propertyName);
      return style;
    }, kebabCase(styleName));
  }

  async getColumnWidth(colLocation: ColLocation) {
    const cols = [colLocation];
    const widths = await getColumnWidths(cols, { page: this.page });

    return widths[0];
  }

  async getVisibleColumnGroupIds() {
    return await getColumnGroupsIds({ page: this.page });
  }

  async getVisibleColumnGroupLabels() {
    return await getColumnGroupsLabels({ page: this.page });
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
    const headerCell = await getHeaderCellForColumn(
      { colId },
      {
        page: this.page,
      },
    ).elementHandle();

    const box = (await headerCell!.boundingBox())!;
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width / 2 + leftOrRight, 0);
    await this.page.mouse.up();
  }
}
