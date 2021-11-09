import { getFnCalls } from '../../../../testUtils/getFnCalls';

const getCalls = getFnCalls('onSortInfoChange');

export default describe('hooks.useProperty - controlled sortInfo', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/hooks/useComponentState/loader/sortInfo/controlled-sortinfo
    `);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly for controlled - outside changes should not trigger onSortInfoChange', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);

    await page.click('#outsidetoggle');

    calls = await getCalls();
    expect(calls.length).toEqual(0);

    await page.click('#outsidetoggle');

    calls = await getCalls();
    expect(calls.length).toEqual(0);
  });

  it('should work correctly for controlled - inner changes should trigger onSortInfoChange', async () => {
    let calls = await getCalls();

    expect(calls.length).toEqual(0);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args).toEqual([[{ dir: -1, field: 'age' }]]);

    await page.click('#inner');

    calls = await getCalls();
    expect(calls.length).toEqual(2);
    expect(calls[1].args).toEqual([[{ dir: 1, field: 'age' }]]);
  });
});
