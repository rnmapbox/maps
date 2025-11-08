import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(compat.extends('@react-native', 'prettier')),
    plugins: { prettier },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
      'prettier/prettier': 'warn',
      // TODO: Remove this rule disable eventually. Deep imports are needed for codegen specs.
      '@react-native/no-deep-imports': 'off',
      // Ensure latest React Hooks rules are enforced (using updated eslint-plugin-react-hooks@7.0.1)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // ES Module files (.mjs)
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'lib/**',
      'tryout/**',
      'temp-issue-3909/**',
      '.yarn/**',
      'plugin/build/**',
      'ios/build/**',
      'example/ios/build/**',
      'example/dist/**',
      'example2/**',
    ],
  },
]);
