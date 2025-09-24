import { test, expect } from '@testing';

export default test.describe
  .parallel('Switching from pivot to normal table', () => {
  test.skip('should properly handle the change', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    await page.getByText('Switch to no pivot').click();

    await page.waitForTimeout(200);
    expect(await tableModel.getVisibleColumnIds()).toEqual([
      'id',
      'name',
      'created_at',
      'stargazers_count',
      'language',
      'has_wiki',
      'week_issue_change',
    ]);

    await page.getByText('Switch to Pivot').click();
    await page.waitForTimeout(200);
    expect(await tableModel.getVisibleColumnIds()).toEqual([
      'group-by-license',
      'group-by-language',

      'stargazers_count:JavaScript',
      'license_count:JavaScript',
      'stargazers_count:TypeScript',
      'license_count:TypeScript',
      'stargazers_count:HTML',
      'license_count:HTML',
    ]);
  });
});
