import { test, expect } from '@testing';

import {
  ALL,
  applyFirstNameFilter,
  readFilterState,
  waitPastFilterDelay,
} from './filter-delay-pending.helpers';

export default test.describe
  .parallel('Filter value typed in the header, with a controlled filterValue', () => {
  test('is applied after filterDelay', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ['Jane', 'Jack'],
      firstNameInput: 'Ja',
      stackInput: '',
      changes: [['firstName:Ja']],
    });
  });

  test('typed in two columns are both applied', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    // the first one comes back as a new filterValue while the second waits
    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await headerModel.filterColumn({ colId: 'stack' }, 'front');
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ['Jack'],
      firstNameInput: 'Ja',
      stackInput: 'front',
      changes: [['firstName:Ja'], ['firstName:Ja', 'stack:front']],
    });
  });

  test('is dropped when a new filterValue sets the column before the delay', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();
    await applyFirstNameFilter(page, headerModel, 'J');

    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await page.evaluate(() => {
      (globalThis as any).setFilterValue([
        {
          field: 'firstName',
          filter: { type: 'string', operator: 'includes', value: 'Ji' },
        },
      ]);
    });
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ['Jill'],
      firstNameInput: 'Ji',
      stackInput: '',
      changes: [['firstName:J']],
    });
  });

  test('is dropped when a new filterValue removes the filters before the delay', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();
    await applyFirstNameFilter(page, headerModel, 'J');

    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await page.evaluate(() => {
      (globalThis as any).setFilterValue([]);
    });
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ALL,
      firstNameInput: '',
      stackInput: '',
      changes: [['firstName:J']],
    });
  });

  test('is dropped when api.clearColumnFilter clears the column before the delay', async ({
    page,
    headerModel,
    rowModel,
    apiModel,
  }) => {
    await page.waitForInfinite();
    await applyFirstNameFilter(page, headerModel, 'J');

    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await apiModel.evaluate((api) => api.clearColumnFilter('firstName'));
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ALL,
      firstNameInput: '',
      stackInput: '',
      changes: [['firstName:J'], ['firstName:']],
    });
  });
});
