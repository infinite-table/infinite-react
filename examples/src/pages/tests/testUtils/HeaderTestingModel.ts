import { Page } from '@testing';
import {
  ColLocation,
  getHeaderCellForColumn,
  getLocatorComputedStylePropertyValue,
} from '.';

const CONTENT_SELECTOR = '.InfiniteCell_content';
export class HeaderTestingModel {
  static get(page: Page) {
    return new HeaderTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getColumnHeaderAlign(cellLocation: ColLocation) {
    const cell = this.getHeaderCellLocator(cellLocation);

    const align = await getLocatorComputedStylePropertyValue({
      handle: cell.locator(CONTENT_SELECTOR),
      page: this.page,
      propertyName: 'justify-content',
    });

    return align === 'flex-start' || align === 'norma;'
      ? 'start'
      : align === 'flex-end'
      ? 'end'
      : 'center';
  }
  async getColumnHeaderVerticalAlign(cellLocation: ColLocation) {
    const cell = this.getHeaderCellLocator(cellLocation);

    const align = await getLocatorComputedStylePropertyValue({
      handle: cell.locator(CONTENT_SELECTOR),
      page: this.page,
      propertyName: 'align-items',
    });

    return align === 'flex-start' || align === 'norma;'
      ? 'start'
      : align === 'flex-end'
      ? 'end'
      : 'center';
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

    return count === 1;
  }

  getColumnMenuLocator() {
    return this.page.locator('.InfiniteMenu');
  }

  async getMenuItems() {
    const menuLocator = await this.getColumnMenuLocator();

    return await menuLocator
      .locator('[data-menu-col-name="label"]')
      .allInnerTexts();
  }

  async openColumnMenu(colLocation: ColLocation) {
    // click the body to make sure any open column menu gets closed
    await this.page.click('body');

    await this.hoverOverColumn(colLocation);

    const headerCell = this.getHeaderCellLocator(colLocation);

    await headerCell.locator('[data-name="menu-icon"]').click();
  }

  async openFilterOperatorMenu(colLocation: ColLocation) {
    // click the body to make sure any open column menu gets closed
    await this.page.click('body');

    await this.hoverOverColumn(colLocation);

    const headerCell = this.getHeaderCellLocator(colLocation);

    await headerCell.locator('[data-name="filter-operator"]').click();
  }

  async clickColumnMenuItem(
    colLocation: ColLocation,
    key: string,
    config?: {
      selector?: string;
      skipOpen?: boolean;
    },
  ) {
    if (config?.skipOpen !== true) {
      await this.openColumnMenu(colLocation);
    }

    let selector = `[data-menu-item-key="${key}"]`;

    if (config?.selector) {
      selector += ` ${config.selector}`;
    }
    await this.page.click(selector);
  }

  async clickFilterOperatorMenuItem(colLocation: ColLocation, key: string) {
    await this.openFilterOperatorMenu(colLocation);

    await this.page.click(`[data-menu-item-key="${key}"]`);
  }

  async filterColumn(colLocation: ColLocation, value: string) {
    await this.getHeaderCellLocator(colLocation).locator('input').fill(value);
  }

  async clickToSortColumn(
    colLocation: ColLocation,
    { ctrlKey } = { ctrlKey: false },
  ) {
    await this.getHeaderCellLocator(colLocation)
      .locator(CONTENT_SELECTOR)
      .click({
        modifiers: ctrlKey ? ['Control', 'Meta'] : [],
      });
  }
}
