import { mapElements, withBrain } from '../testUtils/listUtils';

export default describe('RowListWithExternalScrolling', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/lists/row-list-with-external-scrolling`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should correctly render on scroll', async () => {
    await withBrain((brain) => {
      const COUNT_100 = 100;
      const ITEM_SIZE = 50;
      brain.update(COUNT_100, ITEM_SIZE);
      brain.setScrollPosition({
        scrollTop: 10,
        scrollLeft: 0,
      });
    });

    await page.waitForTimeout(30);
    let elements = await mapElements((el) => el.textContent);
    expect(elements).toEqual([
      'row 0',
      'row 1',
      'row 2',
      'row 3',
      'row 4',
      'row 5',
      'row 6',
    ]);

    await withBrain((brain) => {
      brain.setScrollPosition({
        scrollTop: 210,
        scrollLeft: 0,
      });
    });

    await page.waitForTimeout(30);
    elements = await mapElements((el) => el.textContent);
    expect(elements).toEqual([
      'row 4',
      'row 5',
      'row 6',
      'row 7',
      'row 8',
      'row 9',
      'row 10',
    ]);
  });

  it('should correctly render when scrolled to the end', async () => {
    await page.waitForTimeout(20);
    await withBrain((brain) => {
      const COUNT_5 = 5;
      const ITEM_SIZE = 100;
      brain.update(COUNT_5, ITEM_SIZE);

      brain.setScrollPosition({
        scrollTop: 0,
        scrollLeft: 0,
      });
    });

    await page.waitForTimeout(20);
    let elements = await mapElements((el) => el.textContent);
    expect(elements).toEqual(['row 0', 'row 1', 'row 2', 'row 3']);

    await withBrain((brain) => {
      brain.setScrollPosition({
        scrollTop: 220,
        scrollLeft: 0,
      });
    });

    await page.waitForTimeout(20);
    elements = await mapElements((el) => el.textContent);
    expect(elements).toEqual(['row 1', 'row 2', 'row 3', 'row 4']);

    await withBrain((brain) => {
      brain.setScrollPosition({
        scrollTop: 320,
        scrollLeft: 0,
      });
    });

    await page.waitForTimeout(20);
    elements = await mapElements((el) => el.textContent);
    expect(elements).toEqual(['row 1', 'row 2', 'row 3', 'row 4']);
  });
});
