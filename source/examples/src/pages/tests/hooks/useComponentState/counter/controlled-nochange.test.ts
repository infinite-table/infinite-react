import { getFnCalls } from '../../../testUtils/getFnCalls';

const getCalls = getFnCalls('onValueChange');

const getValue = async () => {
  return await page.evaluate(() => document.querySelector('#value')!.innerHTML);
};

export default describe('hooks.use - controlled value', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/hooks/useComponentState/counter/controlled-nochange`,
    );
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly for controlled - inner changes should trigger onValueChange, even if prop is not updated', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);

    await page.click('#innerinc');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([11]);
    // controlled prop is not updated, so actual value wont change
    expect(await getValue()).toEqual('10');

    await page.click('#innerinc');

    calls = await getCalls();
    expect(calls.length).toEqual(2);
    expect(calls[1].args).toEqual([11]);
    // controlled prop is not updated, so actual value wont change
    expect(await getValue()).toEqual('10');
  });
});
