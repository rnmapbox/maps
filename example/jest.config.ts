import type { Config } from 'jest';
import * as path from 'path';

const config: Config = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.ts'],
  verbose: true,
  moduleNameMapper: {
    '^@rnmapbox/maps$': path.resolve(__dirname, '../src/index.ts'),
  },
};

export default config;
