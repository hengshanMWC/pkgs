
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jsonc/recommended-with-jsonc',
    'plugin:markdown/recommended'
  ],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  },
}

