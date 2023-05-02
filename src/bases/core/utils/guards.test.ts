import {ApplicationError, RuntimeError} from '@bases/core/errors';

import {
  assertDefined,
  assertInstanceOf,
  AssertionError,
  hasProperty,
  hasStringProperty,
  isAssertionError,
  isDefined,
  isInstanceOf,
} from './guards';

const mustDefined = (_: {}) => {};

const complexUnion = () => {
  const random = Math.random();
  if (random > 0.8) {
    return null;
  } else if (random > 0.6) {
    return {string: 'a'} as const;
  } else if (random > 0.4) {
    return 'a';
  } else if (random > 0.3) {
    return 0;
  } else if (random > 0.2) {
    return random > 2.5;
  }
  return undefined;
};

const stringUnion = () => {
  const random = Math.random();
  if (random > 0.8) {
    return null;
  } else if (random > 0.6) {
    return '0.6' as const;
  } else if (random > 0.4) {
    return '0.4' as const;
  } else if (random > 0.3) {
    return '0.3' as const;
  } else if (random > 0.2) {
    return '0.2' as const;
  }
  return undefined;
};

describe('isDefined', () => {
  it.each([[null], [undefined]])('should return false if value is not null or undefined. value=[%s]', value => {
    expect(isDefined(value)).toStrictEqual(false);

    if (isDefined(value)) {
      mustDefined(value); // 型エラーが発生しないことを確認する
    }

    expect(() => assertDefined(value)).toThrow(
      new AssertionError(`value must not be null or undefined but actual value is ${String(value)}.`),
    );
    expect(() => assertDefined(value, 'nullish variable')).toThrow(
      new AssertionError(`nullish variable must not be null or undefined but actual value is ${String(value)}.`),
    );
  });

  it.each([
    [0],
    [false],
    [''],
    [Symbol()],
    [10n],
    [[]],
    [{}],
    [complexUnion()],
    [stringUnion()],
    [[0, false, '', Symbol(), 10n, [], {}, complexUnion(), stringUnion()] as const],
    [
      {
        number: 0,
        boolean: false,
        string: '',
        symbol: Symbol(),
        bigint: 10n,
        array: [],
        object: {},
        complexUnion: complexUnion(),
        stringUnion: stringUnion(),
      } as const,
    ],
  ])('should return true if value is not null or undefined. value=[%s]', value => {
    /* eslint-disable jest/no-conditional-expect -- ランダム値を返す関数を使っていて、valueがdefinedとは限らないので仕方なく */
    if (isDefined(value)) {
      expect(isDefined(value)).toStrictEqual(true);
      mustDefined(value); // 型エラーが発生しないことを確認する
      expect(() => assertDefined(value)).not.toThrow();
    } else {
      expect(isDefined(value)).toStrictEqual(false);
      // @ts-expect-error -- Should be inferred as `null` or `undefined`
      mustDefined(value); // 型エラーが発生しないことを確認する
      expect(() => assertDefined(value)).toThrow(
        new AssertionError(`value must not be null or undefined but actual value is ${String(value)}.`),
      );
    }
    /* eslint-enable */
  });

  it.each([
    // WORKAROUND: Until TypeScript 5.0.0
    //   TypeScript 4.9.5時点では推論結果のUnion型にLiteral型が含まれると（？）、配列のfilterによる型のNarrowingに失敗してしまう。
    // [[complexUnion()]],
    // [[stringUnion()]],
    [
      [
        0,
        false,
        '',
        Symbol(),
        10n,
        [],
        {},
        // WORKAROUND: Until TypeScript 5.0.0
        //   TypeScript 4.9.5時点では推論結果のUnion型にLiteral型が含まれると（？）、配列のfilterによる型のNarrowingに失敗してしまう。
        // complexUnion(),
        // stringUnion()
      ] as const,
    ],
    [
      [
        {
          number: 0,
          boolean: false,
          string: '',
          symbol: Symbol(),
          bigint: 10n,
          array: [],
          object: {},
          complexUnion: complexUnion(),
          stringUnion: stringUnion(),
        } as const,
      ],
    ],
  ])('should guard array items when using Array.prototype.filter. value=[%s]', value => {
    value.filter(isDefined).forEach(v => {
      mustDefined(v); // 型エラーが発生しないことを確認する
      expect(v).not.toBeUndefined();
      expect(v).not.toBeNull();
    });
  });

  it('should report type error for complex inferred type until TypeScript 5.0', () => {
    new Array(10)
      .fill(undefined)
      .map(complexUnion)
      .filter(isDefined)
      .forEach(v => {
        // @ts-expect-error -- TypeScript 4.9.5 fails to infer type of array items if the type is union type including literal type.
        mustDefined(v); // 型エラーが発生することを確認する
        expect(v).not.toBeUndefined();
        expect(v).not.toBeNull();
      });
  });
});

describe('isInstanceOf', () => {
  // noinspection JSPrimitiveTypeWrapperUsage
  it.each([
    {value: new String(''), constructor: String},
    {value: new Number(0), constructor: Number},
    {value: new Boolean(false), constructor: Boolean},
    {value: [], constructor: Array},
    {value: {}, constructor: Object},
    {value: new Date(), constructor: Date},
    {value: () => {}, constructor: Function},
    {value: /regex/i, constructor: RegExp},
    {value: new ApplicationError(), constructor: ApplicationError},
    {value: new ApplicationError(), constructor: Error},
  ])(
    'should return true if value is instance of the class. value=[$value], constructor=[$constructor]',
    ({value, constructor}) => {
      // @ts-expect-error -- 型エラーになったとしても、実行時には期待したとおりに検証されることを確認したいので抑止します
      const guard = isInstanceOf(constructor);
      // @ts-expect-error -- 同上
      const asserts = assertInstanceOf(constructor);
      expect(guard(value)).toStrictEqual(true);
      expect(() => asserts(value)).not.toThrow();
    },
  );

  it.each([
    {value: '', constructor: String},
    {value: 0, constructor: Number},
    {value: false, constructor: Boolean},
    {value: Symbol(), constructor: Symbol},
    {value: 10n, constructor: BigInt},
    {value: BigInt(10), constructor: BigInt},
    {value: new ApplicationError(), constructor: RuntimeError},
  ])('should return false if value is not instance of the class', ({value, constructor}) => {
    // @ts-expect-error -- 型エラーになったとしても、実行時には期待したとおりに検証されることを確認したいので抑止します
    const guard = isInstanceOf(constructor);
    // @ts-expect-error -- 同上
    const asserts = assertInstanceOf(constructor);
    expect(guard(value)).toStrictEqual(false);
    expect(() => asserts(value)).toThrow(
      new AssertionError(`object must be an instance of ${constructor.name} but actual value is ${String(value)}.`),
    );
    expect(() => asserts(value, 'unexpected instance')).toThrow(
      new AssertionError(
        `unexpected instance must be an instance of ${constructor.name} but actual value is ${String(value)}.`,
      ),
    );
  });
});

describe('isAssertionError', () => {
  it('should return true if value is instance of AssertionError', () => {
    expect(isAssertionError(new AssertionError('any message'))).toStrictEqual(true);
  });

  it('should return false if value is not instance of AssertionError', () => {
    expect(isAssertionError(new Error('any message'))).toStrictEqual(false);
    expect(isAssertionError(new RuntimeError('any message'))).toStrictEqual(false);
  });
});

describe('hasProperty', () => {
  test.each([
    ['string', {string: 'string'}],
    ['number', {number: 1}],
    ['bigint', {bigint: 10n}],
    ['boolean', {boolean: true}],
    ['undefined', {undefined}],
    ['symbol', {symbol: Symbol()}],
    ['null', {null: null}],
    ['object', {object: {}}],
    ['array', {array: []}],
    ['function', {function: function f() {}}],
    ['arrow-function', {'arrow-function': () => {}}],
    ['1', {1: undefined}],
  ])(`should return true if value has property. value=[%s] property=[%s]`, (property, value) => {
    const sut = hasProperty(property);
    expect(sut(value)).toBe(true);
  });
  test.each([
    ['any', null],
    ['any', undefined],
    ['any', {}],
    ['toString', 1],
    ['not-exist', {string: 'value'}],
  ])(`should return false if value does not have property. value=[%s] property=[%s]`, (property, value) => {
    const sut = hasProperty(property);
    expect(sut(value)).toBe(false);
  });
});

describe('hasStringProperty', () => {
  test.each([['string', {string: 'string'}]])(
    `should return true if value has property. value=[%s] property=[%s]`,
    (property, value) => {
      const sut = hasStringProperty(property);
      expect(sut(value)).toBe(true);
    },
  );
  test.each([
    ['any', null],
    ['any', undefined],
    ['any', {}],
    ['toString', 1],
    ['not-exist', {string: 'value'}],
    ['number', {number: 1}],
    ['bigint', {bigint: 10n}],
    ['boolean', {boolean: true}],
    ['undefined', {undefined}],
    ['symbol', {symbol: Symbol()}],
    ['null', {null: null}],
    ['object', {object: {}}],
    ['array', {array: []}],
    ['function', {function: function f() {}}],
    ['arrow-function', {'arrow-function': () => {}}],
    ['1', {1: undefined}],
  ])(`should return false if value does not have property. value=[%s] property=[%s]`, (property, value) => {
    const sut = hasStringProperty(property);
    expect(sut(value)).toBe(false);
  });
});
