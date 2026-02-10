import { expect, test } from '@testing';

export default test.describe.parallel('Basic data update', () => {
  test('via API should not rerender header', async ({
    page,
    tracingModel,
    headerModel,
  }) => {
    await page.waitForInfinite();
    const stopTracing = await tracingModel.start();

    const salaryHeader = headerModel.getHeaderCellLocator({ colId: 'salary' });
    const salaryInitialText = await salaryHeader.textContent();

    const updateButton = page.getByRole('button', {
      name: 'update',
      exact: true,
    });

    await updateButton.click();

    expect(await salaryHeader.textContent()).toBe(salaryInitialText);

    await stopTracing();
  });
});
