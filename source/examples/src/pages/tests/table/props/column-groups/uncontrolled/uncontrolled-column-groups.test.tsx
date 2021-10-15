export default describe('Column groups should render correctly', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-groups/uncontrolled/uncontrolled-column-groups`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  /*
   *
   * See ./current.png image in the current folder for how nesting should look like in this test
   *
   */

  it('should remove column when a new key is removed from the columns map', async () => {
    let secondAddressGroup = await page.evaluate(() => {
      return (
        document.querySelectorAll('[data-group-id="address"]')[1] as HTMLElement
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
        document.querySelectorAll('[data-group-id="address"]')[1] as HTMLElement
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
});
