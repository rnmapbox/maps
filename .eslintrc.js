module.exports = {
  root: true,
  parser: 'babel-eslint',
  plugins: ['react', 'react-native', 'fp', 'import'],
  env: {
    jest: true,
  },
  settings: {
    react: {
      version: require('./package.json').dependencies.react,
      pragma: 'React',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
    'import/ignore': ['react-native'],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
        modules: true,
      },
    },
  },
  globals: {
    fetch: true,
    FormData: true,
    requestAnimationFrame: true,
    cancelAnimationFrame: true,
    WebSocket: true,
    __DEV__: true,
    window: true,
    document: true,
    navigator: true,
    XMLSerializer: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    '@react-native-community',
    'prettier',
  ],
  rules: {
    'react/no-deprecated': 'warn',
    'react/no-string-refs': 'warn',
    'import/named': [2],
    'import/no-named-default': [0],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
    'import/exports-last': [0],
    'import/no-useless-path-segments': [2],
    camelcase: [0],
    'no-console': [0],
    'import/prefer-default-export': 'off',
    'jsx-a11y/href-no-hash': 'off',
    'react/prop-types': [2],
    quotes: [2, 'single'],
    'eol-last': [0],
    'no-continue': [1],
    'class-methods-use-this': [0],
    'no-bitwise': [1],
    'prefer-destructuring': [1],
    'consistent-return': [0],
    'no-warning-comments': [1],
    'no-mixed-requires': [0],
    'no-return-assign': 0,
    'no-underscore-dangle': [0],
    'no-await-in-loop': 0,
    'no-restricted-syntax': 0,
    'no-use-before-define': ['error', { functions: false }],
    'no-unused-expressions': ['error', { allowTaggedTemplates: true }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'fp/no-mutating-methods': 'warn',
    'react-native/no-inline-styles': 0,
  },
  overrides: [
    {
      // Match TypeScript Files
      files: ['**/*.{ts,tsx}'],

      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        '@react-native-community',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      rules: {
        'no-shadow': 'off',
        'import/named': 'off',
      },
    },
  ],
};
