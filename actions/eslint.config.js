import eslint from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import globals from "globals"

const __GLOBALS__ = {
  // /-- node --/
  ...globals.node,
}

const __CONFIGS__ = [
  // /-- skipped (globs) --/
  {
    ignores: [
      "**/_old/**",
    ],
  },
  // /-- built-in (recommended) --/
  eslint.configs.recommended,
  // /-- custom (extended) --/
  {
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      globals: __GLOBALS__,
    },
    rules: {
      // /-- stylistic --/
      "@stylistic/array-bracket-spacing": [ "error", "always" ],
      "@stylistic/arrow-parens": [ "error", "as-needed" ],
      "@stylistic/arrow-spacing": [ "error", { "before": true, "after": true } ],
      "@stylistic/block-spacing": "error",
      "@stylistic/brace-style": [ "error", "1tbs", { "allowSingleLine": true } ],
      "@stylistic/comma-dangle": [ "error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "never",
      } ],
      "@stylistic/comma-spacing": "error",
      "@stylistic/comma-style": "error",
      "@stylistic/computed-property-spacing": "error",
      "@stylistic/dot-location": [ "error", "property" ],
      "@stylistic/eol-last": [ "error", "always" ],
      "@stylistic/indent": [ "error", 2, { "SwitchCase": 1 } ],
      "@stylistic/keyword-spacing": "error",
      "@stylistic/linebreak-style": [ "error", "unix" ],
      "@stylistic/max-statements-per-line": [ "error", { "max": 2 } ],
      "@stylistic/no-floating-decimal": "error",
      "@stylistic/no-mixed-spaces-and-tabs": "error",
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/no-multiple-empty-lines": [ "error", { "max": 2, "maxEOF": 1, "maxBOF": 0 } ],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/object-curly-spacing": [ "error", "always" ],
      "@stylistic/template-curly-spacing": "error",
      "@stylistic/quotes": [ "error", "double" ],
      "@stylistic/rest-spread-spacing": "error",
      "@stylistic/semi": [ "error", "never" ],
      "@stylistic/space-before-blocks": "error",
      "@stylistic/space-before-function-paren": [ "error", {
        "anonymous": "never",
        "named": "never",
        "asyncArrow": "always",
      } ],
      "@stylistic/space-in-parens": "error",
      "@stylistic/space-infix-ops": "error",
      "@stylistic/space-unary-ops": "error",
      "@stylistic/spaced-comment": [ "error", "always", { "markers": [ "/" ] } ],
      // /-- eslint --/
      "no-empty-function": "error",
      "no-inline-comments": "error",
      "no-lonely-if": "error",
      "no-shadow": [ "error", { "allow": [ "err", "resolve", "reject" ] } ],
      "no-unused-vars": [ "error", { "args": "none", "caughtErrors": "none", "varsIgnorePattern": "^_", "destructuredArrayIgnorePattern": ".*" } ],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "max-nested-callbacks": [ "error", 4 ],
      "curly": [ "error", "multi-line", "consistent" ],
      "yoda": "error",
    },
  },
]

export default __CONFIGS__
