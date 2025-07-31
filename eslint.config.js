// eslint.config.js
const tseslint = require('@typescript-eslint/eslint-plugin');
const typescript = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');

module.exports = [
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescript,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: '.',
				sourceType: 'module',
			},
			globals: {
				// Common Node.js globals
				process: 'readonly',
				__dirname: 'readonly',
				module: 'readonly',
				require: 'readonly',
				// Jest testing environment
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				jest: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			prettier,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'prettier/prettier': ['error'],
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
	},
];
