
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
    // Possible Errors
    'no-constant-condition': 'warn',

    // Stylistic Issues
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', 'stroustrup'],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'func-call-spacing': ['error', 'never'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'max-len': ['error', {
      code: 80,
      tabWidth: 2,
    }],
    'new-cap': 'error',
    'object-curly-spacing': ['error', 'always'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
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

    // Best Practices
    'array-callback-return': 'error',
    eqeqeq: 'error',
    'no-cond-assign': ['error', 'always'],
    'no-debugger': 'error',
    'no-extra-bind': 'error',
    'no-loop-func': 'error',
    'no-invalid-this': 'error',
    'no-return-await': 'error',

    // Variables
    'no-unused-vars': 'warn',
    'no-undef': 'error',

    // ECMAScript 6
    'arrow-parens': ['error', 'as-needed'],
    'object-shorthand': [
      'error',
      'always',
      {
        ignoreConstructors: false,
        avoidQuotes: true,
      },
    ],
    'no-var': 'error',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: true,
      },
    ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
}
