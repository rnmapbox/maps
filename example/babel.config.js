module.exports = (api) => {
  const isWeb = api.caller(isTargetWeb);

  return {
    presets: [
      '@babel/preset-typescript',
      'module:metro-react-native-babel-preset',
    ],
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-transform-modules-commonjs',
      isWeb
        ? [
            'module-resolver',
            {
              alias: {
                '@rnmapbox/maps': './rnmapbox.web.symlink',
              },
            },
          ]
        : [
            'module-resolver',
            {
              alias: {
                '@rnmapbox/maps': '../src',
                react: './node_modules/react',
                'react-native': './node_modules/react-native',
                '@babel': './node_modules/@babel',
                '@turf': './node_modules/@turf',
                '@mapbox': './node_modules/@mapbox',
                debounce: './node_modules/debounce',
                'prop-types': './node_modules/prop-types',
              },
            },
          ],
    ].filter(Boolean),
  };
};

function isTargetWeb(caller) {
  return caller && caller.name === 'babel-loader';
}
