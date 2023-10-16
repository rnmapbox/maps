import type { Config } from 'jest';

function rnfix(path: string): string {
  return path.replace('@rnmapbox/maps', '<rootDir>/..');
}

const config: Config = {
  verbose: true,
  preset: 'react-native',
  roots: ['__tests__/'],
  setupFilesAfterEnv: [rnfix('@rnmapbox/maps/setup-jest')],
  moduleNameMapper: {
    '@rnmapbox/maps': '<rootDir>/..',
  },
};

export default config;
