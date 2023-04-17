module.exports = {
  extends: [
    // https://github.com/expo/expo/tree/master/packages/eslint-config-universe
    'universe/native',
    // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
    'plugin:react-hooks/recommended',
    // https://tanstack.com/query/latest/docs/react/eslint/eslint-plugin-query
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  rules: {
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.*',
          '**/*.spec.*',
          'jest/**',
          '.eslintrc.js',
          'babel.config.js',
          'jest.config.js',
          'metro.config.js',
        ],
      },
    ],
    // https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    'import/internal-regex': '^(@@/|@@assets/|@/|@bases/|@features/|@fixtures/)',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      plugins: [
        // https://github.com/gund/eslint-plugin-deprecation
        'deprecation',
      ],
      extends: [
        // https://github.com/expo/expo/tree/master/packages/eslint-config-universe
        'universe/shared/typescript-analysis',
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/ban-types.md
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              // By default, the rule treats `{}` as being equivalent to `object`.
              // However, this is not entirely accurate, as `{}` actually represents any type except for `null` or `undefined`.
              // As a result, `{}` is not interchangeable with `object`.
              // For instance, the code `const c: {} = 1` is valid, but `const c: object = 1` is not.
              '{}': false,
            },
            extendDefaults: true,
          },
        ],
        // Consistent type usage
        // https://typescript-eslint.io/rules/consistent-type-definitions
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        // https://typescript-eslint.io/rules/consistent-type-exports
        '@typescript-eslint/consistent-type-exports': 'error',
        // https://typescript-eslint.io/rules/consistent-type-imports
        '@typescript-eslint/consistent-type-imports': 'error',
        // Deprecated API usage
        'deprecation/deprecation': 'error',
      },
    },
    {
      files: ['*.test.ts', '*.test.tsx'],
      extends: [
        // https://github.com/jest-community/eslint-plugin-jest#shareable-configurations
        'plugin:jest/recommended',
      ],
      rules: {
        // you should turn the original rule off *only* for test files
        // https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/unbound-method.md
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'error',
      },
    },
    {
      files: ['*.tsx'],
      rules: {
        // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-misused-promises.md
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            // It is too strict to prohibit passing async functions to `onPress`, so disable the rule in JSX.
            checksVoidReturn: false,
          },
        ],
      },
    },
    {
      files: ['.eslintrc.js', 'babel.config.js', 'jest.config.js', 'metro.config.js', 'jest/**'],
      globals: {
        __dirname: 'readonly',
      },
      env: {
        node: true,
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', '!.eslintrc.js', '!.prettierrc.js'],
};
