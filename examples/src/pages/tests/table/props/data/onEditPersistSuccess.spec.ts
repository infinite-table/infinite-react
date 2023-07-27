import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';
import { test, expect, Page } from '@testing';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onEditPersistSuccess', { page });
}

export default test.describe.parallel('Mutations simple test', () => {
  test('editing triggers onEditPersistSuccess with value from column.getValueToPersist', async ({
    page,
    editModel,
  }) => {
    await page.waitForInfinite();
    const cell = {
      colId: 'age',
      rowIndex: 1,
    };
    await editModel.startEdit({ ...cell, event: 'enter', value: '120' });

    await editModel.confirmEdit(cell);

    await page.waitForTimeout(50);

    let calls = await getCalls({ page });

    expect(calls.length).toEqual(1);
    expect(calls[0].args[0].value).toEqual(1200);
  });
});
