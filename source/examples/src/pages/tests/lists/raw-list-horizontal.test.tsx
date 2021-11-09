import { mapElements } from '../testUtils/listUtils';

const arr = (size: number) => {
  return [...new Array(size)].map((_, i) => `#${i}`);
};
export default describe('RawList-Horizontal', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/lists/raw-list-horizontal`);
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should correctly render on scroll', async () => {
    await page.waitForTimeout(20);

    let result = await mapElements((el) => el.textContent);
    expect(result).toEqual(arr(12));

    // click button to render less items
    await page.click('button');
    await page.waitForTimeout(20);

    result = await mapElements((el) => el.textContent);
    expect(result).toEqual(arr(8));

    // click button again to go to initial state
    await page.click('button');
    await page.waitForTimeout(20);

    result = await mapElements((el) => el.textContent);
    expect(result).toEqual(arr(12));
  });
});
