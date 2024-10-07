import { CSSCalc as calc } from './CSSCalc';

it('should work for +', () => {
  expect(calc.add(2, 3).done()).toEqual('calc(2 + 3)');
  expect(calc.add(calc.subtract(5, 3), 2).done()).toEqual('calc(5 - 3 + 2)');
  expect(calc.add(calc.subtract(calc.add(2, 3), 5)).done()).toEqual(
    'calc(2 + 3 - 5)',
  );
  expect(calc.add(calc.subtract(calc.add(2, 3), 5), 12).done()).toEqual(
    'calc(2 + 3 - 5 + 12)',
  );
});

it('should work for real-case usage', () => {
  expect(calc.add('a', 'b').subtract('x').add('y').done()).toEqual(
    'calc(a + b - x + y)',
  );
});

it('should work for + with nested calcs', () => {
  expect(calc.add(1, calc.multiply(2, 3).done()).done()).toEqual(
    'calc(1 + calc(2 * 3))',
  );
});

it('should work for + with chaining', () => {
  expect(calc.add(2, 3).subtract(1).done()).toEqual('calc(2 + 3 - 1)');
});

it('should work for *', () => {
  expect(calc.multiply(2, 3).done()).toEqual('calc(2 * 3)');
  expect(calc.multiply(calc.subtract(5, 3), 2).done()).toEqual(
    'calc((5 - 3) * 2)',
  );
  expect(calc.multiply(calc.subtract(calc.multiply(2, 3), 5)).done()).toEqual(
    'calc(2 * 3 - 5)',
  );
  expect(
    calc.multiply(calc.subtract(calc.multiply(2, 3), 5), 12).done(),
  ).toEqual('calc((2 * 3 - 5) * 12)');
});

it('should work for * with nested calcs', () => {
  expect(calc.multiply(1, calc.multiply(2, 3).done()).done()).toEqual(
    'calc(1 * calc(2 * 3))',
  );
});

it('should work for * with chaining', () => {
  expect(calc.multiply(2, 3).subtract(1).done()).toEqual('calc(2 * 3 - 1)');
});

it('should work for /', () => {
  expect(calc.divide(2, 3).done()).toEqual('calc(2 / 3)');
  expect(calc.divide(calc.subtract(5, 3), 2).done()).toEqual(
    'calc((5 - 3) / 2)',
  );
  expect(calc.subtract(calc.divide(2, 3), 5).done()).toEqual('calc(2 / 3 - 5)');
  expect(calc.divide(calc.subtract(calc.divide(2, 3), 5), 12).done()).toEqual(
    'calc((2 / 3 - 5) / 12)',
  );
});

it('should work for / with nested calcs', () => {
  expect(calc.divide(1, calc.divide(2, 3).done()).done()).toEqual(
    'calc(1 / calc(2 / 3))',
  );
});

it('should work for / with chaining', () => {
  expect(calc.divide(2, 3).subtract(1).done()).toEqual('calc(2 / 3 - 1)');
});

it('should work for complex case', () => {
  expect(calc.multiply(2, calc.add(3, 4).done()).done()).toEqual(
    'calc(2 * calc(3 + 4))',
  );
  expect(
    calc
      .multiply(
        2,
        calc.add(
          3,
          calc.subtract(9, calc.multiply(calc.minus(8, 7), calc.add('b', 1))),
        ),
        5,
        calc.divide(6, calc.minus(7).done()),
      )
      .done(),
  ).toEqual('calc(2 * (3 + 9 - (8 - 7) * (b + 1)) * 5 * (6 / calc(7)))');
});
