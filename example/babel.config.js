module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    [
        'module-resolver',
        {
          alias: {
            '@react-native-mapbox-gl/maps': '../javascript/index',
            // from maps/package.json
            react: './node_modules/react',
            'react-native': './node_modules/react-native',
            '@turf/helpers': './node_modules/@turf/helpers',
            '@turf/distance': './node_modules/@turf/distance',
            '@turf/nearest-point-on-line': './node_modules/@turf/nearest-point-on-line',
            '@turf/length': './node_modules/@turf/length',
            '@turf/along': './node_modules/@turf/along',
            '@mapbox/geo-viewport': './node_modules/@mapbox/geo-viewport',
            'debounce': './node_modules/debounce',

            '@babel': './node_modules/@babel',
            fbjs: './node_modules/fbjs',
            'hoist-non-react-statics': './node_modules/hoist-non-react-statics',
            invariant: './node_modules/invariant',
            'prop-types': './node_modules/prop-types',
          },
        }
    ]
  ].filter(Boolean),
};
