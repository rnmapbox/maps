module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    'commonjs',
    'module',
    'typescript',
    [
      'custom',
      {
        script: 'build:copy-plugin',
      },
    ],
  ],
};
