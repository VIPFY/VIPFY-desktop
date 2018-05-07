module.exports = {
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parser: "babel-eslint",
  env: {
    node: true,
    browser: true,
    es6: true
  },
  rules: {
    eqeqeq: "off",
    strict: 0,
    quotes: [2, "double", { allowTemplateLiterals: true }],
    semi: "off",
    "react/prop-types": "off",
    "space-before-function-paren": "off",
    "react/prefer-stateless-function": 1,
    "no-console": "off",
    "react/display-name": "off"
  }
};
