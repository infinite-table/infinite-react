import { test, expect } from '@testing';

export default test.describe.parallel('Sorting via column menu', () => {
  test('should correctly replace existing sorting, when multiSortBehavior = replace', async ({
    page,
    tableModel,
    headerModel,
  }) => {
    await page.waitForInfinite();

    const { getColumnHeaders } = tableModel.withHeader();

    expect(await getColumnHeaders()).toEqual([
      'firstName',
      'country\n1',
      'salary\n2',
      'age',
      'id',
      'canDesign',
      'preferredLanguage',
      'stack',
      'hobby',
      'city',
      'currency',
    ]);

    await headerModel.clickColumnMenuItem('age', 'sort-asc');

    expect(await getColumnHeaders()).toEqual([
      'firstName',
      'country\n1',
      'salary\n2',
      'age\n3',
      'id',
      'canDesign',
      'preferredLanguage',
      'stack',
      'hobby',
      'city',
      'currency',
    ]);

    await headerModel.clickColumnMenuItem('salary', 'sort-none');

    expect(await getColumnHeaders()).toEqual([
      'firstName',
      'country\n1',
      'salary',
      'age\n2',
      'id',
      'canDesign',
      'preferredLanguage',
      'stack',
      'hobby',
      'city',
      'currency',
    ]);
  });
});
