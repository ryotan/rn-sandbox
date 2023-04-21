/*
 * `@base/core/errors`との循環参照を避けるために、ここにAssertionErrorを定義しています。
 *
 * Errorの型ガード関数にisInstanceOfを使いたいので、`@base/core/errors`->`@base/core/utils/guards`の依存関係ができてしまいます。
 * `assertXXX`では何らかの固有のエラーを投げたいのですが、`@base/core/errors`に依存すると循環参照になってしまうので、仕方なくここに定義しています。
 */

import {ErrorWrapper} from '@bases/core/errors/ErrorWrapper';

import type {AbstractConstructor} from './types';

export class AssertionError extends ErrorWrapper {}
export const isAssertionError = (object: unknown): object is AssertionError => object instanceof AssertionError;

export const isDefined = <T>(value: T): value is NonNullable<T> => value != null;
export const assertDefined = <T>(value: T, name: string = 'value'): asserts value is NonNullable<T> => {
  if (!isDefined(value)) {
    throw new AssertionError(`${name} must not be null or undefined but actual value is ${String(value)}.`);
  }
};

export const isInstanceOf =
  <T extends AbstractConstructor>(constructor: T) =>
  (object: unknown): object is InstanceType<T> =>
    object instanceof constructor;
export const assertInstanceOf =
  <T extends AbstractConstructor>(constructor: T) =>
  (object: unknown, name: string = 'object'): asserts object is InstanceType<T> => {
    if (!(object instanceof constructor)) {
      throw new AssertionError(
        `${name} must be an instance of ${constructor.name} but actual value is ${String(object)}.`,
      );
    }
  };
