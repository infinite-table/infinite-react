import { test, expect } from '@testing';

export default test.describe.parallel('Lazy multiRowSelectionTarget', () => {
  test('is passed to the data function and changing it does not refetch', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const calls = () =>
      page.evaluate(() => (globalThis as any).dataParamsCalls);

    await expect.poll(async () => (await calls()).length).toBe(1);
    expect((await calls())[0]).toEqual({
      groupKeys: [],
      multiRowSelectionTarget: 'visible',
    });

    await page.evaluate(() => (globalThis as any).setTarget('all'));
    await page.waitForTimeout(300);
    expect(await calls()).toHaveLength(1);

    await rowModel.toggleGroupRow(0);
    await expect.poll(async () => (await calls()).length).toBe(2);
    expect((await calls())[1].multiRowSelectionTarget).toBe('all');
  });
});
