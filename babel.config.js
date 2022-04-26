module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
