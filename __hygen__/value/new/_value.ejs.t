---
to: src/<%= h.capitalize(name) %>.ts
unless_exists: true
---
<% type = h.capitalize(name) -%>
import {z} from 'zod';

import {AssertionError} from '@bases/core/utils';

export type <%= type -%> = z.infer<typeof <%= type -%>>;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Keep zod schema name and type name consistent.
export const <%= type -%> = z.string().brand('<%= type -%>');

export const is<%= type -%> = (value: unknown): value is <%= type -%> => {
  return <%= type -%>.safeParse(value).success;
};
export const assert<%= type -%> = (value: unknown, name: string = 'value'): asserts value is <%= type -%> => {
  try {
    <%= type -%>.parse(value);
  } catch (error) {
    throw new AssertionError(`${name} must be '<%= type %>' but actual value is ${String(value)}.`, error);
  }
};
