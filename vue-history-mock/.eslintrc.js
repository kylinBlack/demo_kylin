module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "multiline-ternary":["error", "never"],
    "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 4 }]
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
