import { adjustColumnOrderForPinning } from '@src/components/InfiniteTable/utils/adjustColumnOrderForPinning';

export default describe('adjustColumnOrderForPinning', () => {
  it('should behave correctly case 1', () => {
    const order = ['ps1', 'u1', 'pe1', 'pe2', 'u2', 'ps2'];
    const newOrder = adjustColumnOrderForPinning(
      order,
      new Map([
        ['ps1', 'start'],
        ['ps2', 'start'],
        ['pe1', 'end'],
        ['pe2', 'end'],
      ]),
    );

    expect(newOrder).toEqual(['ps1', 'ps2', 'u1', 'u2', 'pe1', 'pe2']);
  });
  it('should behave correctly when there are only pinned start cols', () => {
    const order = ['ps1', 'u1', 'u2', 'ps2'];

    const newOrder = adjustColumnOrderForPinning(
      order,
      new Map([
        ['ps1', 'start'],
        ['ps2', 'start'],
      ]),
    );

    expect(newOrder).toEqual(['ps1', 'ps2', 'u1', 'u2']);
  });
});
