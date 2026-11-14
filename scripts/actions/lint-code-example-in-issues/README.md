## Debugging

The lint rejects local files in the code example, except `../assets/example.png` and `../assets/example.glb` (both in `example/src/assets`).



```sh
npm install
node ./fetch-issue-for-testing.js 2871
GITHUB_EVENT_PATH=./test-issue.json node lint-code-example-in-issues.js
```

to use vscode debugger enable auto attach, then:


```sh
npm install
node ./fetch-issue-for-testing.js 2871
GITHUB_EVENT_PATH=./test-issue.json node --inspect lint-code-example-in-issues.js
```

To test linting on a js file:
```sh
npm install
LINT_FILE=example.jsx  node lint-code-example-in-issues.js
```