type CSSContinuationType = {
  __operation: CSSCalcOperation | null;
  __get: (parent?: CSSContinuationType) => string;
  done: () => string;
} & CSSCalcMethods;

type CSSCalcOperation = '*' | '/' | '+' | '-';
type CSSOperand = string | number | CSSContinuationType;

type CSSCalcMethods = {
  add: (...args: CSSOperand[]) => CSSContinuationType;
  subtract: (...args: CSSOperand[]) => CSSContinuationType;
  minus: (...args: CSSOperand[]) => CSSContinuationType;
  multiply: (...args: CSSOperand[]) => CSSContinuationType;
  divide: (...args: CSSOperand[]) => CSSContinuationType;
};

function mapToContinuation(args: CSSOperand[]): CSSContinuationType[] {
  return args.map((arg) =>
    arg instanceof CssContinuation ? arg : new CssContinuation(null, [arg]),
  );
}

export class CssContinuation implements CSSContinuationType {
  __operands: CSSOperand[] = [];
  __operation: CSSCalcOperation | null = null;

  constructor(operation: CSSCalcOperation | null, operands: CSSOperand[] = []) {
    this.__operands = operands;
    this.__operation = operation;
  }

  add(...args: CSSOperand[]): CSSContinuationType {
    return new CssContinuation('+', [this, ...args]);
  }
  subtract(...args: CSSOperand[]): CSSContinuationType {
    return new CssContinuation('-', [this, ...args]);
  }
  minus(...args: CSSOperand[]): CSSContinuationType {
    return this.subtract(...args);
  }
  multiply(...args: CSSOperand[]): CSSContinuationType {
    return new CssContinuation('*', [this, ...args]);
  }
  divide(...args: CSSOperand[]): CSSContinuationType {
    return new CssContinuation('/', [this, ...args]);
  }
  __get(parent?: CSSContinuationType): string {
    const { __operation, __operands } = this;

    const result = __operands
      .map((operand) => operandToString(operand, this))
      .join(` ${__operation} `);

    const skipParens =
      __operands.length <= 1
        ? true
        : parent?.__operation === '+' || parent?.__operation === '-';

    return skipParens ? result : `(${result})`;
  }
  done(): string {
    const str = this.__get();

    const hasParens = str.startsWith('(') && str.endsWith(')');
    const value = hasParens ? str : `(${str})`;

    return `calc${value}`;
  }
}

function operandToString(
  operand: CSSOperand,
  parent?: CSSContinuationType,
): string {
  if (typeof operand === 'string' || typeof operand === 'number') {
    return `${operand}`;
  }
  if (!parent) {
    return operand.done();
  }

  return operand.__get(parent);
}

const add = (...args: CSSOperand[]) =>
  new CssContinuation('+', mapToContinuation(args));

const subtract = (...args: CSSOperand[]) =>
  new CssContinuation('-', mapToContinuation(args));

const multiply = (...args: CSSOperand[]) =>
  new CssContinuation('*', mapToContinuation(args));

const divide = (...args: CSSOperand[]) =>
  new CssContinuation('/', mapToContinuation(args));

export const CSSCalc = {
  add,
  subtract,
  minus: subtract,
  multiply,
  divide,
};
