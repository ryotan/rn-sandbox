---
to: src/features/<%= feature %>/errors/<%= h.capitalize(name) %>.test.ts
---
<% klass = h.capitalize(name) -%>
<% parent = h.truthy(runtime) ? 'RuntimeError' : 'ApplicationError' -%>
import {<%= parent %>} from '@bases/core/errors';
import {AssertionError} from '@bases/core/utils';

import {<%= klass %>, assert<%= klass %>, is<%= klass %>} from './<%= klass %>';

class <%= klass %>SubClass extends <%= klass %> {}
class SomeError extends <%= parent %> {}

describe('is<%= klass %>', () => {
  it.each([[null], [undefined], [{}], [new SomeError()]])('should return false if arg=[%s]', arg => {
    expect(is<%= klass %>(arg)).toBe(false);
    expect(() => assert<%= klass %>(arg)).toThrow(AssertionError);
  });

  it.each([[new <%= klass %>()], [new <%= klass %>SubClass()]])('should return true if arg=[%s]', arg => {
    expect(is<%= klass %>(arg)).toBe(true);
    expect(() => assert<%= klass %>(arg)).not.toThrow(AssertionError);
  });
});
