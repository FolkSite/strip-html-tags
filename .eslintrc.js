module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'airbnb-base',
  'env': {
    'jasmine': true,
    'browser': true,
    'node': true
  },
  'rules': {
    'import/extensions': ['error', 'always', {
      'js': 'never'
    }],
    'import/no-extraneous-dependencies': 0,
    'no-underscore-dangle' : ['error', { 'allow': ['_destroy'] }],
    'no-undef' : 1,
    'prefer-template' : 0,
    'no-param-reassign' : 0,
    'no-shadow' : 0,
    'comma-dangle': ['error', 'never'],
    'space-before-function-paren': ['error', 'always'],
    'semi': ['error', 'never']
  }
}
