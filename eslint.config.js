const globals = require('globals');

module.exports = [{
  files: ['**/*.js'],
  languageOptions: { ecmaVersion: 2022, globals: globals.node },
  rules: {
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
  },
}];
