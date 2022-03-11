import { test, expect } from '@playwright/test';

export default test.describe.parallel(
  'Column groups should render correctly',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `tests/table/props/column-groups/uncontrolled/uncontrolled-column-groups`,
      );
    });

    /*
     *
     * See ./current.png image in the current folder for how nesting should look like in this test
     *
     */

    test('should remove column when a new key is removed from the columns map', async ({
      page,
    }) => {
      let secondAddressGroup = await page.evaluate(() => {
        return (
          document.querySelectorAll(
            '[data-group-id="address"]',
          )[1] as HTMLElement
        ).innerText.split('\n');
      });

      expect(secondAddressGroup).toEqual([
        'Address',
        'location',
        'country',
        'region',
      ]);

      await page.evaluate(() => {
        // update the groups via columnGroups.set method

        (window as any).columnGroups.set('contact info', {
          columnGroup: 'address',
          header: 'Contact info',
        });
      });

      await page.waitForTimeout(30);

      secondAddressGroup = await page.evaluate(() => {
        return (
          document.querySelectorAll(
            '[data-group-id="address"]',
          )[1] as HTMLElement
        ).innerText.split('\n');
      });

      expect(secondAddressGroup).toEqual([
        'Address',
        'location',
        'country',
        'region',
        'Contact info',
        'email',
        'phone',
      ]);
    });
  },
);
