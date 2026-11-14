const config = require('../../react-native.config');
const { codegenConfig } = require('../../package.json');

describe('react-native.config', () => {
  it('lists a component descriptor for every codegen component', () => {
    const { componentDescriptors } = config.dependency.platforms.android;
    const expected = Object.keys(codegenConfig.ios.components).map(
      (name) => `${name}ComponentDescriptor`,
    );
    expect([...componentDescriptors].sort()).toEqual(expected.sort());
  });
});
