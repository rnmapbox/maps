const path = require('path');

const { getConfig } = require('react-native-builder-bob/babel-config');

const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = getConfig(
  {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'babel-plugin-react-compiler',
        {
          // Log what the compiler is doing (set to false to disable logging)
          // When enabled, you'll see "React Compiler: compiled X functions" in Metro logs
          compilationMode: 'annotation', // 'annotation' | 'all' | 'infer'
        },
      ],
    ],
  },
  { root, pkg },
);
