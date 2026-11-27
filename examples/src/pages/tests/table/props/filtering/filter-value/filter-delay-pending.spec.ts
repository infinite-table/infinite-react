import { test, expect } from '@testing';

import {
  ALL,
  applyFirstNameFilter,
  readFilterState,
  waitPastFilterDelay,
} from './filter-delay-pending.helpers';

export default test.describe
  .parallel('Filter value typed in the header', () => {
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

  test('is dropped when api.clearColumnFilter is called for a column with no filter yet', async ({
    page,
    headerModel,
    rowModel,
    apiModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await apiModel.evaluate((api) => api.clearColumnFilter('firstName'));
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ALL,
      firstNameInput: '',
      stackInput: '',
      changes: [],
    });
  });

  test('is dropped when api.setColumnFilter sets the column before the delay', async ({
    page,
    headerModel,
    rowModel,
    apiModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await apiModel.evaluate((api) => api.setColumnFilter('firstName', 'Ji'));
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ['Jill'],
      firstNameInput: 'Ji',
      stackInput: '',
      changes: [['firstName:Ji']],
    });
  });

  test('is still applied when the filter of another column is set', async ({
    page,
    headerModel,
    rowModel,
    apiModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.filterColumn({ colId: 'firstName' }, 'Ja');
    await apiModel.evaluate((api) => api.setColumnFilter('stack', 'front'));
    await waitPastFilterDelay(page);

    expect(await readFilterState(page, rowModel, headerModel)).toEqual({
      rows: ['Jack'],
      firstNameInput: 'Ja',
      stackInput: 'front',
      changes: [['stack:front'], ['stack:front', 'firstName:Ja']],
    });
  });
});
