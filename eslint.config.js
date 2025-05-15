import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

export default [
  {
    ...js.configs.recommended,
    ignores: ['dist/', 'node_modules/'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        // add more globals as needed
      },
    },
    rules: {
      // add custom rules here
    },
  },
  prettier,
]
