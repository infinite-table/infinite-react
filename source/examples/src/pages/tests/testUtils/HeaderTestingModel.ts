import { Page } from '@playwright/test';
import { getHeaderCellByColumnId } from '.';

export class HeaderTestingModel {
  static get(page: Page) {
    return new HeaderTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickSelectionCheckbox(colId: string) {
    const cell = getHeaderCellByColumnId(colId, { page: this.page });

    await cell.locator('input').click();

    return cell;
  }
}
