import { getFnCalls } from '../../../testUtils/getFnCalls';

const getCalls = getFnCalls('onLoadingChange');

export default describe('hooks.useProperty - controlled boolean nochange', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/hooks/useComponentState/loader/controlled-loading-nochange
    `);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly for controlled - inner changes should trigger onLoadingChange but loading will remain false', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([true]);

    await page.click('#inner');

    // // the loading prop is never updated
    // // so onLoadingChange should be continously called with loading=true
    // // as it tries to update it
    calls = await getCalls();
    expect(calls.length).toEqual(2);
    expect(calls[1].args).toEqual([true]);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(3);
    expect(calls[2].args).toEqual([true]);
  });
});
