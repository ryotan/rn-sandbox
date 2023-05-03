import {defineConfig} from 'orval';

export default defineConfig({
  backend: {
    output: {
      mode: 'tags',
      clean: true,
      target: 'src/features/backend/apis/api.ts',
      schemas: 'src/features/backend/apis/model',
      client: 'react-query',
      prettier: true,
      tsconfig: 'tsconfig.json',
      override: {
        query: {
          useQuery: true,
        },
        mutator: {
          path: 'src/bases/http-client/httpCall.ts',
          name: 'httpCall',
        },
      },
    },
    input: {
      target: './openapi.yml',
    },
  },
});
