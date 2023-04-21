---
to: src/<%= h.capitalize(name) %>.test.ts
unless_exists: true
---
<% type = h.capitalize(name) -%>
import {z} from 'zod';

import {AssertionError} from '@bases/core/utils';

import {<%= type %>, is<%= type %>, assert<%= type %>} from './<%= type %>';

describe('<%= type %>', () => {
  describe.each([
    {arg: {}, expected: {}}
  ])('should successfully parse an object if valid (arg=[$arg])', ({arg, expected}) => {
    test('<%= type %>.parse', () => {
      expect(<%= type %>.parse(arg)).toEqual(expected);
    });
    test('is<%= type %>', () => {
      expect(is<%= type %>(arg)).toBe(true);
    });
    test('assert<%= type %>', () => {
      expect(() => assert<%= type %>(arg)).not.toThrow();
    });
  });

  describe.each([
    [undefined],
    [null],
    [{}],
  ])('should fail to parse an object if invalid (value=[%s])', (arg) => {
    test('<%= type %>.parse', () => {
      expect(() => <%= type %>.parse(arg)).toThrow(z.ZodError);
    });
    test('is<%= type %>', () => {
      expect(is<%= type %>(arg)).toBe(false);
    });
    test('assert<%= type %>', () => {
      expect(() => assert<%= type %>(arg)).toThrow(AssertionError);
      expect(() => assert<%= type %>(arg)).toThrow(
        `value must be '<%= type %>' but actual value is ${String(arg)}.`,
      );
      expect(() => assert<%= type %>(arg, '<%= h.changeCase.lower(type) %>')).toThrow(
        `<%= h.changeCase.lower(type) %> must be '<%= type %>' but actual value is ${String(arg)}.`,
      );
    });
  });
});
