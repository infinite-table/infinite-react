import { getFnCalls } from '../testUtils';

const getCalls = getFnCalls('onCountChange');

const getValues = async () => {
  return await page.evaluate(() => {
    return JSON.parse(
      (document.querySelector('#text') as HTMLElement).innerText,
    );
  });
};

const INITIAL = {
  state: 10,
  value: 10,
};
export default describe('hooks.useProperty - controlled with internal state', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/hooks/useProperty/controlled-internal-state/controlled-nochange
    `);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should not update when no change in controlled prop', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);
    expect(await getValues()).toEqual(INITIAL);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([11]);
    expect(await getValues()).toEqual(INITIAL);

    await page.click('#inner');

    // the count prop is never updated, and has an initial value of 10
    // so onCountChange should be continously called with count=11
    // as it tries to update it
    calls = await getCalls();
    expect(calls.length).toEqual(2);
    expect(calls[1].args).toEqual([11]);
    expect(await getValues()).toEqual(INITIAL);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(3);
    expect(calls[2].args).toEqual([11]);
    expect(await getValues()).toEqual(INITIAL);

    // now click on outer, and should update
    await page.click('#outer');

    calls = await getCalls();
    expect(calls.length).toEqual(3);

    expect(await getValues()).toEqual({
      state: 11,
      value: 11,
    });

    await page.click('#outer');
    expect(await getValues()).toEqual({
      state: 12,
      value: 12,
    });
  });
});
