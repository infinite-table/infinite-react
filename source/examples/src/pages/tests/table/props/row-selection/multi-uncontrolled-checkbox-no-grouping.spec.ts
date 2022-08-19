import { test, expect } from '@testing';

export default test.describe.parallel(
  'Uncontrolled Multi Row Selection with checkbox',
  () => {
    test('should be able to use shift key to select more records', async ({
      page,
      rowModel,
    }) => {
      await page.waitForInfinite();

      let ids = await rowModel.getSelectedRowIdsForVisibleRows();

      expect(ids).toEqual([]);

      let cell = await rowModel.clickRow(2);

      // press space key to toggle selection
      await cell.press(' ');
      ids = await rowModel.getSelectedRowIdsForVisibleRows();
      expect(ids).toEqual(['3']);

      // now go to row 4
      cell = await rowModel.clickRow(4);

      // and pressing space key with shift modifier
      await cell.press('Shift+ ');
      ids = await rowModel.getSelectedRowIdsForVisibleRows();

      // expect all in-between ids to have been correctly selected
      expect(ids).toEqual(['3', '4', '5']);

      // now shift+spacebar on the first row
      cell = await rowModel.clickRow(0);
      await cell.press('Shift+ ');

      ids = await rowModel.getSelectedRowIdsForVisibleRows();

      // and expect selection to have changed
      expect(ids).toEqual(['1', '2', '3']);

      // now simply hit spacebar on row 4
      cell = await rowModel.clickRow(4);
      await cell.press(' ');
      ids = await rowModel.getSelectedRowIdsForVisibleRows();

      // and expect selection to have changed
      expect(ids).toEqual(['1', '2', '3', '5']);
    });
  },
);
