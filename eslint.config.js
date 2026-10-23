import github from "eslint-plugin-github";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["dist/**"],
  },
  github.getFlatConfigs().recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.node,
    },
    rules: {
      "i18n-text/no-en": "off",
      "import/no-commonjs": "off",
      "github/filenames-match-regex": "off",
      "import/extensions": ["error", "ignorePackages", { js: "always" }],
    },
  },
];
