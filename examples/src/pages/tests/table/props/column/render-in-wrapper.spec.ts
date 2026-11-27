import { test, expect } from '@testing';

import { HeaderTestingModel } from '../../../testUtils/HeaderTestingModel';
import { RowTestingModel } from '../../../testUtils/RowTestingModel';

// what the wrapper components inside the header and the cells show
async function getWrapperTexts(
  rowModel: RowTestingModel,
  headerModel: HeaderTestingModel,
) {
  const wrapper = '[data-name="wrapper"]';
  return {
    header: await headerModel
      .getHeaderCellLocator({ colId: 'firstName' })
      .locator(wrapper)
      .innerText(),
    firstNames: await Promise.all(
      [0, 1, 2].map((rowIndex) =>
        rowModel
          .getCellLocator({ rowIndex, colId: 'firstName' })
          .locator(wrapper)
          .innerText(),
      ),
    ),
    ages: await Promise.all(
      [0, 1, 2].map((rowIndex) =>
        rowModel
          .getCellLocator({ rowIndex, colId: 'age' })
          .locator(wrapper)
          .innerText(),
      ),
    ),
  };
}

const visible = {
  header: 'First name',
  firstNames: ['John', 'Marry', 'Bill'],
  ages: ['20 years ★', '25 years ★', '30 years ★'],
};

export default test.describe
  .parallel('Content rendered inside a wrapper', () => {
  test('shows text, templates and components', async ({
    page,
    rowModel,
    headerModel,
  }) => {
    await page.waitForInfinite();

    expect(await getWrapperTexts(rowModel, headerModel)).toEqual(visible);
  });

  test('follows the wrapper hiding and showing it', async ({
    page,
    rowModel,
    headerModel,
  }) => {
    await page.waitForInfinite();

    await page.evaluate(() => (globalThis as any).setWrappersOpen(false));
    await expect
      .poll(() => getWrapperTexts(rowModel, headerModel))
      .toEqual({
        header: '',
        firstNames: ['', '', ''],
        ages: ['', '', ''],
      });

    await page.evaluate(() => (globalThis as any).setWrappersOpen(true));
    await expect
      .poll(() => getWrapperTexts(rowModel, headerModel))
      .toEqual(visible);
  });
});
