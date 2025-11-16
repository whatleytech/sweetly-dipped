import config from "@sweetly-dipped/config-eslint/library.js";
import globals from 'globals';

export default [
  {
    ignores: ['generated/**/*'],
  },
  ...config,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.jest,
      },
    },
  },
];
