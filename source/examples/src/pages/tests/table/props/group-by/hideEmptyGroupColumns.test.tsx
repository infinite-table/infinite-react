import { getHeaderColumnIds } from '../../../testUtils';

export default describe('hideEmptyGroupColumns', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/group-by/hideEmptyGroupColumns`,
    );
  });

  beforeEach(async () => {
    await page.reload();

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });

  it('should work in complex case, when we have a custom id for a group column ', async () => {
    await page.click('button');

    let ids = await getHeaderColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expander-icon"]`);

    await page.waitForTimeout(50);
    ids = await getHeaderColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'custom-country',
      'firstName',
      'country',
      'department',
    ]);
  });

  it('should work in simple case, when we dont have a custom id for a group column ', async () => {
    let ids = await getHeaderColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expander-icon"]`);

    await page.waitForTimeout(50);
    ids = await getHeaderColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'group-by-country',
      'firstName',
      'country',
      'department',
    ]);
  });

  it('should be able to change hideEmptyGroupColumns from true to false at runtime, and the hidden group columns should show up', async () => {
    await page.click('input[type="checkbox"]');

    await page.waitForTimeout(20);
    let ids = await getHeaderColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'group-by-country',
      'firstName',
      'country',
      'department',
    ]);
  });
});
