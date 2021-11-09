import { getFnCalls } from '../../../../testUtils/getFnCalls';

const getCalls = getFnCalls('onSortInfoChange');

export default describe('hooks.useProperty - controlled boolean nochange', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/hooks/useComponentState/loader/sortInfo/controlled-sortinfo-nochange
    `);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly for controlled - inner changes should trigger onSortInfoChange but sortInfo will retain the initial value', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([[{ dir: -1, field: 'age' }]]);

    await page.click('#inner');

    // the sortInfo prop is never updated
    // so onSortInfoChange should be continously called with sortInfo=[{dir: -1, field: 'age'}]
    // as it tries to update it
    calls = await getCalls();
    expect(calls.length).toEqual(2);
    expect(calls[1].args).toEqual([[{ dir: -1, field: 'age' }]]);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(3);
    expect(calls[2].args).toEqual([[{ dir: -1, field: 'age' }]]);
  });
});
