
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:jsonc/recommended-with-jsonc',
    'plugin:markdown/recommended',
    'plugin:import/recommended',
  ],
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.mjs', '.ts', '.d.ts'] },
    },
  },
  rules: {
    // import
    'import/order': 'error',
    'import/first': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-unresolved': 'off',
    'import/no-absolute-path': 'off',

    // format
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'eqeqeq': 'error',
    'no-extra-bind': 'error',
    'no-invalid-this': 'error',
    'no-loop-func': 'error',
    'max-len': ['error', {
      code: 80,
      tabWidth: 2,
    }],
    'new-cap': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'quote-props': ['error', 'consistent-as-needed'],
    'no-unused-vars': 'warn',
    'no-constant-condition': 'warn',
    'brace-style': ['error', 'stroustrup'],
    'block-spacing': ['error', 'always'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'no-debugger': 'error',
    'no-cond-assign': ['error', 'always'],
    'func-call-spacing': ['error', 'never'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'object-curly-spacing': ['error', 'always'],

    // es+
    'no-return-await': 'error',
    'no-var': 'error',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: true,
      },
    ],
    'object-shorthand': [
      'error',
      'always',
      {
        ignoreConstructors: false,
        avoidQuotes: true,
      },
    ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'arrow-parens': ['error', 'as-needed'],
    'spaced-comment': ['error', 'always', {
      line: {
        markers: ['/'],
        exceptions: ['/', '#'],
      },
      block: {
        markers: ['!'],
        exceptions: ['*'],
        balanced: true,
      },
    }],
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
}
