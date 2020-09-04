module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
    es6: true,
    browser: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react-native/all',
    'prettier',
    'prettier/@typescript-eslint',
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true
    },
    project: './tsconfig.json',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'import',
    'prettier',
  ],
  settings: {
    "import/resolver": {
      "node": {
        "extensions": [
          ".js",
          ".jsx",
          ".ts",
          ".tsx"
        ]
      }
    },
    "react": {
      "version": "detect", // React version. "detect" automatically picks the version you have installed.
                           // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
                           // default to latest and warns if missing
                           // It will default to "detect" in the future
    },
  },
  rules: {
    camelcase: 0,
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'global-require': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    'jsx-quotes': ['error', 'prefer-double'],
    'import/no-extraneous-dependencies': ['error', { packageDir: './' }],
    'import/prefer-default-export': 'off',
    'import/first': 1,
    'import/order': ['error', { groups: ['external', 'internal'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        'js': 'never',
        'jsx': 'never',
        'ts': 'never',
        'tsx': 'never'
      }
    ],
    'arrow-body-style': 0,
    'no-plusplus': 0,
    'function-paren-newline': 0,
    'no-unused-expressions': 0,
    'import/no-cycle': 0,
    'no-use-before-define': 0,
    'prefer-promise-reject-errors': 0,
    'comma-dangle': 0,
    'class-methods-use-this': 0,
    'react/prefer-stateless-function': 0,
    'react/destructuring-assignment': 0,
    'react/no-unescaped-entities': 0,
    'react-native/split-platform-components': 0,
    'react-native/no-color-literals': 0,
    'react/jsx-filename-extension': [
      1,
      { extensions: ['.js', '.jsx', '.tsx'] }
    ],
    'react/jsx-boolean-value': 0,
    'react/jsx-tag-spacing': [
      'error',
      {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never'
      }
    ],
    'react/jsx-props-no-spreading': 0, // we like our speads just fine, thank you very much
    'react/static-property-placement': 0, // we can ignore this - soon to be removed anyways
    'react/jsx-curly-newline': 0,
    'react/state-in-constructor': 0, // it is ok to initialize state as a class prop
    'react/prop-types': 0,
    'react/sort-comp': 0,
    'prettier/prettier': 'error',
    'react/jsx-one-expression-per-line': 0,
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off', // don´t want to type every argument again like getState or dispatch (and many more)
  },
  'overrides': [
    {
      // enable the rule specifically for TypeScript files
      'files': ['*.ts', '*.tsx'],
      'rules': {
        // turn these one to check where all the return types are missing
        // and where arguments of functions are not typed
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': ['error']
      }
    }
  ],
  globals: {
    __DEV__: true,
    element: true,
    by: true,
    waitFor: true // detox e2e
  }
};
