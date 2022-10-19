import { Page } from '@playwright/test';
import { ColLocation, getHeaderCellForColumn } from '.';

export class HeaderTestingModel {
  static get(page: Page) {
    return new HeaderTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickSelectionCheckbox(colId: string) {
    const cell = getHeaderCellForColumn({ colId }, { page: this.page });

    await cell.locator('input').click();

    return cell;
  }

  getHeaderCellLocator(colLocation: ColLocation) {
    return getHeaderCellForColumn(colLocation, { page: this.page });
  }

  async getTextForHeaderCell(colLocation: ColLocation) {
    const locator = this.getHeaderCellLocator(colLocation);

    return await locator.evaluate((node) => (node as HTMLElement).innerText);
  }

  async clickColumnHeader(colLocation: ColLocation) {
    const cell = this.getHeaderCellLocator(colLocation);

    await cell.click();

    return cell;
  }
}
