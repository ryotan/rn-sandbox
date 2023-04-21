---
to: src/features/<%= feature %>/errors/<%= h.capitalize(name) %>.ts
---
<% klass = h.capitalize(name) -%>
<% parent = h.truthy(runtime) ? 'RuntimeError' : 'ApplicationError' -%>
import {<%= parent %>} from '@bases/core/errors';
import {assertInstanceOf, isInstanceOf} from '@bases/core/utils';

export class <%= klass %> extends <%= parent %> {}

export const is<%= klass %> = isInstanceOf(<%= klass %>);
export const assert<%= klass %> = assertInstanceOf(<%= klass %>);
