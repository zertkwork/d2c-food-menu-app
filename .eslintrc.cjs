/*
 Architecture guardrails for the repository.
 This configuration intentionally keeps scope narrow and simple.
 It enforces two rules ONLY within backend/core:
 1) Forbid any import from paths containing "/adapters/"
 2) Forbid any usage of process.env
*/

module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: false,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  ignorePatterns: [
    'node_modules/',
    'frontend/',
    'backend/frontend/dist/',
  ],
  overrides: [
    {
      files: ['backend/core/**/*.{ts,tsx,js}'],
      rules: {
        // 1) Forbid any import from /adapters inside /core
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/adapters/**'],
                message: 'Architecture violation: core must not import from adapters.',
              },
              {
                group: ['**/infra/**', '**/adapters/**/config/**', 'dotenv', 'config'],
                message:
                  'Architecture violation: core must not import runtime or adapter configuration (env/config). Plumb configuration via adapters/infra layers only at the boundary.',
              },
            ],
          },
        ],
        // 2) Forbid any use of process.env inside /core
        'no-restricted-properties': [
          'error',
          {
            object: 'process',
            property: 'env',
            message:
              'Architecture violation: do not access process.env from core. Plumb configuration via adapters/infra layers.',
          },
        ],
      },
    },
  ],
};
