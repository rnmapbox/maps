## Debugging



```sh
npm install
node ./fetch-issue.js
GITHUB_EVENT_PATH=./test-issue.json node lint-code-example-in-issues.js
```

to use vscode debugger enable auto attach, then:


```sh
npm install
node ./fetch-issue-for-testing.js 2871
GITHUB_EVENT_PATH=./test-issue.json node --inspect lint-code-example-in-issues.js
```