import { Page } from '@playwright/test';
import { getMenuCellLocatorForKey } from '.';

export class MenuTestingModel {
  static get(page: Page) {
    return new MenuTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getTextForCell(params: string | { rowKey: string; colName?: string }) {
    const rowKey = typeof params === 'string' ? params : params.rowKey;
    const colName = typeof params === 'string' ? undefined : params.colName;

    const locator = getMenuCellLocatorForKey(
      { rowKey, colName },
      { page: this.page },
    );

    return await locator.innerText();
  }

  getMenuLocator() {
    return getMenuCellLocatorForKey(
      { rowKey: null },
      { page: this.page },
    ).first();
  }

  async isMenuOpen() {
    return await this.getMenuLocator().isVisible();
  }
}
