import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'warn',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single']
    }
  },
  {
    ignores: ['dist/', 'node_modules/', 'prisma/']
  }
);
