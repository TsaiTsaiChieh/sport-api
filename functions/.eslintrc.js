module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ['standard'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
<<<<<<< HEAD
    camelcase: 'off',
    semi: 0,
    'no-tabs': 0,
||||||| merged common ancestors
    'camelcase': 'off',
    'semi':0,
    'no-tabs':0,
=======
    'camelcase': 'off',
    'no-tabs':0,
>>>>>>> test
    'no-unused-vars': 0,
<<<<<<< HEAD
    'no-async-promise-executor': 0,
    'prefer-promise-reject-errors': 0,
    'block-spacing': 0,
    'space-before-function-paren': 0
||||||| merged common ancestors
    'no-async-promise-executor':0,
    'prefer-promise-reject-errors':0,
    'block-spacing':0,
    'space-before-function-paren':0
=======
    'no-async-promise-executor':0,
    'prefer-promise-reject-errors':0,
    'block-spacing':0,
    'space-before-function-paren':['error','never'],
    'semi':['error','always']
>>>>>>> test
  }
};
