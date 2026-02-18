import nextConfig from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  prettier,
  {
    ignores: ['src/generated/**', '.next/**', 'node_modules/**'],
  },
];

export default config;
