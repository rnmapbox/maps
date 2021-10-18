module.exports = {
  root: true,
  parser: 'babel-eslint',
  plugins: ['react', 'react-native', 'fp', 'import', 'prettier'],
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
    'prettier',
    '@react-native-community',
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
    'no-use-before-define': ['error', {functions: false}],
    'no-unused-expressions': ['error', {allowTaggedTemplates: true}],
    'no-plusplus': ['error', {allowForLoopAfterthoughts: true}],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: false,
      },
    ],
    'fp/no-mutating-methods': 'warn',
  },
  overrides: [
    // Match TypeScript Files
    // =================================
    {
      files: ['**/*.{ts,tsx}'],

      // Global ESLint Settings
      // =================================
      env: {
        jest: true,
        es6: true,
        browser: true,
        node: true,
      },
      globals: {
        __DEV__: true,
        element: true,
        by: true,
        waitFor: true, // detox e2e
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
          },
        },
        react: {
          version: 'detect', // React version. "detect" automatically picks the version you have installed.
          // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
          // default to latest and warns if missing
          // It will default to "detect" in the future
        },
      },

      // Parser Settings
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // Lint with Type Information
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
        ecmaFeatures: {
          experimentalObjectRestSpread: true,
          jsx: true,
        },
        sourceType: 'module',
      },

      // Extend Other Configs
      // =================================
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react-native/all',
        'eslint:recommended',
        'plugin:react/recommended',
        'prettier',
      ],
      plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
      rules: {
        // turn these one to check where all the return types are missing
        // and where arguments of functions are not typed
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': ['error'],
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['warn'],
        'react/prop-types': 'off',
      },
    },
  ],
};
