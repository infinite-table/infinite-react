import { Page } from '@playwright/test';
import { CellLocation } from '.';
import { ColumnTestingModel } from './ColumnTestingModel';

export class EditTestingModel {
  colModel: ColumnTestingModel;
  static get(page: Page) {
    return new EditTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.colModel = new ColumnTestingModel(page);
  }

  async startEdit(
    param: {
      event: 'dblclick' | 'enter';
      value?: string;
    } & CellLocation,
  ) {
    const cell = this.colModel.getCellLocator(param);

    if (param.event === 'dblclick') {
      await cell.dblclick();
    } else {
      await cell.click();
      await cell.press('Enter');
    }

    if (param.value) {
      const input = this.getCellEditor(param);
      await input.fill(param.value);
    }
  }

  getCellEditor(cellLocation: CellLocation) {
    return this.colModel.getCellLocator(cellLocation).locator('input');
  }

  async isEditorOpen(cellLocation: CellLocation) {
    const inputLocator = this.getCellEditor(cellLocation);

    return await inputLocator.isVisible();
  }

  async getValueInEditor(cellLocation: CellLocation) {
    const inputLocator = this.getCellEditor(cellLocation);

    return await inputLocator.inputValue();
  }

  async confirmEdit(cell: CellLocation) {
    const editor = this.getCellEditor(cell);

    await editor.press('Enter');

    await this.page.waitForTimeout(30);
  }
  async cancelEdit(cell: CellLocation) {
    const editor = this.getCellEditor(cell);

    await editor.press('Escape');
  }
}
