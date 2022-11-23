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
  async hoverOverColumn(colLocation: ColLocation) {
    const headerCell = await this.getHeaderCellLocator(
      colLocation,
    ).elementHandle();

    const box = (await headerCell!.boundingBox())!;
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  }

  async hasColumnMenu(colLocation: ColLocation) {
    await this.hoverOverColumn(colLocation);

    const headerCell = this.getHeaderCellLocator(colLocation);

    const count = await headerCell.locator('[data-name="menu-icon"]').count();

    return count > 0;
  }

  async openColumnMenu(colLocation: ColLocation) {
    await this.hoverOverColumn(colLocation);

    const headerCell = this.getHeaderCellLocator(colLocation);

    await headerCell.locator('[data-name="menu-icon"]').click();
  }

  async clickColumnMenuItem(colLocation: ColLocation, key: string) {
    await this.openColumnMenu(colLocation);

    await this.page.click(`[data-menu-item-key="${key}"]`);
  }
}
