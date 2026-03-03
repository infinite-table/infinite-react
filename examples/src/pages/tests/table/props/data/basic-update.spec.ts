import { expect, test } from '@testing';

export default test.describe.parallel('Basic data update', () => {
  test('via API should not rerender header', async ({ page, headerModel }) => {
    await page.waitForInfinite();

    const salaryHeader = headerModel.getHeaderCellLocator({ colId: 'salary' });
    const salaryInitialText = await salaryHeader.textContent();

    const updateButton = page.getByRole('button', {
      name: 'update',
      exact: true,
    });

    await updateButton.click();

    expect(await salaryHeader.textContent()).toBe(salaryInitialText);
  });
});
