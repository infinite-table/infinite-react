import { getFnCalls } from '../../../testUtils/getFnCalls';

const getCalls = getFnCalls('onValueChange');

const getValue = async () => {
  return await page.evaluate(() => document.querySelector('#value')!.innerHTML);
};

export default describe('hooks.use - controlled value', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/hooks/useComponentState/counter/uncontrolled`,
    );
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly for uncontrolled - inner changes should trigger onValueChange', async () => {
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

  it('should work correctly for uncontrolled - outside default value change should not do anything', async () => {
    let calls = await getCalls();

    await page.waitForTimeout(10);
    expect(calls.length).toEqual(0);

    await page.click('#outsideinc');

    calls = await getCalls();
    expect(calls.length).toEqual(0);
    expect(await getValue()).toEqual('10');

    await page.click('#outsidedec');

    calls = await getCalls();
    expect(calls.length).toEqual(0);
    expect(await getValue()).toEqual('10');

    await page.click('#innerinc');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([11]);

    expect(await getValue()).toEqual('11');

    await page.click('#innerdec');
    await page.click('#innerdec');

    calls = await getCalls();
    expect(calls.length).toEqual(3);
    expect(calls[2].args).toEqual([9]);

    expect(await getValue()).toEqual('9');
  });
});
