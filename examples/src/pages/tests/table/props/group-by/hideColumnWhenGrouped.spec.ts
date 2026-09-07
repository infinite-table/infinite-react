import { test, expect } from '@testing';

export default test.describe
  .parallel('Column order in grouping with hideColumnWhenGrouped', () => {
  test('check it works', async ({ page, columnModel }) => {
    await page.waitForInfinite();

    let colIds = await columnModel.getVisibleColumnIds();

    expect(colIds).toEqual(['group-by', 'id', 'firstName']);

    await columnModel.moveColumn('firstName', -200);

    colIds = await columnModel.getVisibleColumnIds();

    expect(colIds).toEqual(['group-by', 'firstName', 'id']);

    // click first button to ungroup
    await page.getByRole('button', { name: 'ungroup' }).click();
    colIds = await columnModel.getVisibleColumnIds();

    expect(colIds).toEqual(['firstName', 'id', 'preferredLanguage', 'stack']);

    // now group again by clicking the second button - target it by name,
    // as a bare `button` locator also matches the next.js dev overlay buttons
    await page.getByRole('button', { name: /group by/ }).click();

    colIds = await columnModel.getVisibleColumnIds();

    expect(colIds).toEqual(['group-by', 'firstName', 'id']);
  });
});
