import { resizeColumnGroupById } from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column Group Resizing', () => {
  test('works correctly', async ({ page, columnModel }) => {
    await page.waitForInfinite();

    let sizes = (
      await columnModel.getColumnWidths(['salary', 'age', 'canDesign'])
    ).list;

    // expect initial sizes are correct
    expect(sizes).toEqual([100, 100, 100]);

    await resizeColumnGroupById('test', 150, { page });
    sizes = (await columnModel.getColumnWidths(['salary', 'age', 'canDesign']))
      .list;

    // on resize, space distributed equally
    expect(sizes).toEqual([150, 150, 150]);

    await columnModel.resizeColumn('age', 150);
    sizes = (await columnModel.getColumnWidths(['salary', 'age', 'canDesign']))
      .list;

    // resizing the age column will make it bigger
    expect(sizes).toEqual([150, 300, 150]);

    await resizeColumnGroupById('test', 200, { page });
    sizes = (await columnModel.getColumnWidths(['salary', 'age', 'canDesign']))
      .list;

    // on group resize, space is again distributed proportionally based on previous sizes
    expect(sizes).toEqual([200, 400, 200]);
  });

  test('respects minWidths', async ({ page, columnModel }) => {
    await page.waitForInfinite();

    let sizes = (
      await columnModel.getColumnWidths(['salary', 'age', 'canDesign'])
    ).list;

    // expect initial sizes are correct
    expect(sizes).toEqual([100, 100, 100]);

    await resizeColumnGroupById('test', -1000, { page });
    sizes = (await columnModel.getColumnWidths(['salary', 'age', 'canDesign']))
      .list;

    // on resize, space distributed equally, and they are
    expect(sizes).toEqual([50, 50, 50]);
  });
});
