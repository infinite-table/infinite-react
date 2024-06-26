import { test, expect } from '@testing';

export default test.describe
  .parallel('Column groups should render correctly', () => {
  /*
   *
   * See ./current.png image in the current folder for how nesting should look like in this test
   *
   */

  test('should remove column when a new key is removed from the columns map', async ({
    page,
  }) => {
    await page.load();
    const locationText = await (
      await page.locator(
        '.InfiniteHeader [data-group-id="location,country,region"]',
      )
    ).innerText();
    const countryText = await (
      await page.locator(
        '.InfiniteHeader [data-col-index="5"][data-row-index="2"]',
      )
    ).innerText();

    expect(locationText).toEqual('location');
    expect(countryText).toEqual('country');

    const secondAddressNode = await page.locator(
      '.InfiniteHeader [data-col-index="5"][data-row-index="0"]',
    );

    expect(
      await secondAddressNode.evaluate((node) => node.dataset.groupId),
    ).toEqual('address,country,region');
    expect(
      await secondAddressNode.evaluate((node: HTMLElement) => node.offsetWidth),
    ).toEqual(480);

    await page.evaluate(() => {
      // update the groups
      (window as any).setColumnGroups((columnGroups: any) => {
        columnGroups = { ...columnGroups };
        columnGroups['contact info'] = {
          columnGroup: 'address',
          header: 'Contact info',
        };
        return columnGroups;
      });
    });

    await page.waitForTimeout(30);

    expect(
      await secondAddressNode.evaluate((node) => node.dataset.groupId),
    ).toEqual('address,country,region,email,phone');
    expect(
      await secondAddressNode.evaluate((node: HTMLElement) => node.offsetWidth),
    ).toEqual(960);
  });
});
