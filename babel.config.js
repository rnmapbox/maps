module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Use @babel/preset-flow when
    // https://github.com/babel/babel/issues/7233 is fixed
    '@babel/plugin-transform-flow-strip-types',
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    '@babel/plugin-transform-exponentiation-operator',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
