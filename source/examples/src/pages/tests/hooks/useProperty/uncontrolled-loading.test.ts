import { getFnCalls } from './testUtils';

const getCalls = getFnCalls('onLoadingChange');

export default describe('hooks.useProperty - controlled boolean', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/hooks/useProperty/uncontrolled-loading
    `);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly for uncontrolled - outside changes should not change state or trigger onLoadingChange', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);

    await page.click('#outsidetoggle');

    calls = await getCalls();
    expect(calls.length).toEqual(0);

    await page.click('#outsidetoggle');

    calls = await getCalls();
    expect(calls.length).toEqual(0);
  });

  it('should work correctly for uncontrolled - inner changes should trigger onLoadingChange', async () => {
    let calls = await getCalls();
    expect(calls.length).toEqual(0);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([true]);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(2);
    expect(calls[1].args).toEqual([false]);
  });
});
