export default describe('DataSource', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/datasource/default`);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should show loading for 2 seconds', async () => {
    await expect(page).toMatch('loading');

    await page.waitForTimeout(100);

    await expect(page).toMatch('loading');

    // await jestPuppeteer.debug();

    await page.waitForTimeout(250);

    await expect(page).toMatch('bob');
    await expect(page).toMatch('bill');
  });
});
