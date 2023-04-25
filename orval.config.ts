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
          path: 'src/features/backend/utils/customInstance.ts',
          name: 'backendCustomInstance',
        },
      },
    },
    input: {
      target: './openapi.yml',
    },
  },
});
