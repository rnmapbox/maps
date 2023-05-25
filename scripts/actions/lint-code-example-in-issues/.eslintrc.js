
module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "plugin:react/recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "settings": {
        "react": {
            "version": "17.0.2"
        }
    },
    "plugins": [
        "react",
        "eslint-plugin-import",
    ],
    "rules": {
        "import/prefer-default-export": ["error"],
        "no-undef": "error",
    },
    "ignorePatterns": [".eslintrc.js", "lint-code-example-in-issues.js", "fetch-issue-for-testing.js"],
}
