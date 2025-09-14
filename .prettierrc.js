/** @type {import('prettier').Config} */
module.exports = {
  arrowParens: 'avoid',       // (x) => x  ⟶  x => x
  singleQuote: true,          // prefer 'test' over "test"
  trailingComma: 'all',       // multi-line trailing commas
  semi: true,                 // for compatibility and clarity with ESLint default
  tabWidth: 2,
};