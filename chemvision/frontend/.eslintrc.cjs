module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: ['@typescript-eslint', 'jsx-a11y'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',

    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Relax rules for shadcn/ui primitive components
      files: ['components/ui/*.tsx'],
      rules: {
        'jsx-a11y/heading-has-content': 'off',
        'jsx-a11y/label-has-associated-control': 'off',
      },
    },
  ],
}
