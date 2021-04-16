import { mapElements, withBrain } from '../../../utils/listUtils';

export default describe('RawList', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/lists/raw-list`);
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should correctly render on scroll', async () => {
    let range = await withBrain((brain) => {
      const COUNT_100 = 100;
      const ITEM_SIZE = 50;
      brain.update(COUNT_100, ITEM_SIZE);

      brain.setAvailableSize({
        height: 510,
        width: 100,
      });
      brain.setScrollPosition({
        scrollTop: 10,
        scrollLeft: 0,
      });

      return brain.getRenderRange();
    });

    expect(range).toEqual({ renderStartIndex: 0, renderEndIndex: 11 });

    range = await withBrain((brain) => {
      brain.setScrollPosition({
        scrollTop: 51,
        scrollLeft: 0,
      });
      return brain.getRenderRange();
    });

    expect(range).toEqual({ renderStartIndex: 1, renderEndIndex: 12 });

    //increment the size so we can render one more item in range
    range = await withBrain((brain) => {
      brain.setAvailableSize({
        height: 560,
        width: 100,
      });
      return brain.getRenderRange();
    });

    //and expect appropriate range now
    expect(range).toEqual({ renderStartIndex: 1, renderEndIndex: 13 });

    range = await withBrain((brain) => {
      brain.setAvailableSize({
        height: 130,
        width: 100,
      });
      return brain.getRenderRange();
    });

    expect(range).toEqual({ renderStartIndex: 1, renderEndIndex: 4 });

    await page.waitForTimeout(10);
    const result = await mapElements((el) => el.textContent);
    expect(result).toEqual(['#1', '#2', '#3', '#4']);
  });

  it('should render item when available size = 1', async () => {
    let range = await withBrain((brain) => {
      const ITEM_SIZE = 50;
      brain.update(0, ITEM_SIZE);

      brain.setAvailableSize({
        height: 1,
        width: 100,
      });

      return brain.getRenderRange();
    });
    expect(range).toEqual({ renderStartIndex: -1, renderEndIndex: -1 });

    await page.waitForTimeout(10);
    const result = await mapElements((el) => el.textContent);

    expect(result).toEqual([]);
  });

  it('should render no items when available size is zero', async () => {
    let range = await withBrain((brain) => {
      const ITEM_SIZE = 50;
      brain.update(0, ITEM_SIZE);

      brain.setAvailableSize({
        height: 0,
        width: 0,
      });

      return brain.getRenderRange();
    });
    expect(range).toEqual({ renderStartIndex: -1, renderEndIndex: -1 });

    await page.waitForTimeout(10);
    const result = await mapElements((el) => el.textContent);

    expect(result).toEqual([]);
  });
});
