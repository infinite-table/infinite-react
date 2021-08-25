import { getFnCalls } from '../../useProperty/testUtils';

const getCalls = getFnCalls('onValueChange');

const getValue = async () => {
  return await page.evaluate(() => document.querySelector('#value')!.innerHTML);
};

export default describe('hooks.use - controlled sortInfo', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/hooks/useComponentState/counter/controlled-change`,
    );
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly for controlled - outside changes should not trigger onValueChange', async () => {
    let calls = await getCalls();
    expect(calls.length).toEqual(0);

    await page.click('#outsideinc');

    calls = await getCalls();
    expect(calls.length).toEqual(0);
    expect(await getValue()).toEqual('11');

    await page.click('#outsideinc');

    calls = await getCalls();
    expect(calls.length).toEqual(0);
    expect(await getValue()).toEqual('12');

    await page.click('#outsidedec');

    calls = await getCalls();
    expect(calls.length).toEqual(0);
    expect(await getValue()).toEqual('11');
  });

  it('should work correctly for controlled - inner changes should trigger onValueChange', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);

    await page.click('#innerinc');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([11]);
    expect(await getValue()).toEqual('11');

    await page.click('#innerinc');

    calls = await getCalls();
    expect(calls.length).toEqual(2);
    expect(calls[1].args).toEqual([12]);
    expect(await getValue()).toEqual('12');
  });
});
