// Runs eslint on the code example in the issue body and posts a comment with the lint results.

const fs = require('fs');

const core = require('@actions/core');
const github = require('@actions/github');
const { ESLint } = require('eslint');

const Config = {
  /// the login of the but used to make the comment
  botLogin: 'github-actions[bot]',
  /// the label to add when lint fails
  label: 'error-in-code',
  /// ignore issues with this label
  ignoreLabels: ['bug-setup 🪲'],
  /// this is the marker is added to all comments made by this action
  commentMarker: '<!-- lint-action -->',
  /// the comment prefix to add when lint fails
  commentPrelude:
    '## Lint failed :sob:\n\nPlease fix the errors in your code example - [More info](https://github.com/rnmapbox/maps/wiki/ErrorInExamplesInIssue).:\n\n',
  /// the comment to add when no code example is found
  noCodeExampleComment:
    'No code example found in issue body - [More info](https://github.com/rnmapbox/maps/wiki/ErrorInExamplesInIssue)',
  /// whether to close the issue if no code example is found
  closeIssueIfNoCodeExample: true,
  /// whether to close the issue when lint fails
  closeIssue: true,
  /// whether to reopen the issue when lint passes
  reopenIssue: true,
  /// eslint formatter to use (stylish or codeframe is recommended)
  formatter: 'codeframe',
  closeLabel: 'reopen-on-code-fixed',
  /// the eslint config used for javascript
  eslintConfig: {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: 'plugin:react/recommended',
    overrides: [],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: '17.0.2',
      },
    },
    plugins: ['react', 'eslint-plugin-import', 'eslint-plugin-node'],
    rules: {
      'import/prefer-default-export': ['error'],
      'no-undef': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*', '!../assets/example.png'],
              message:
                'Repo example should complete - it should not use files from your project',
            },
            {
              group: ['!react', '!react-native', '!@rnmapbox/maps'],
              message: 'Should not use third-party libraries',
            },
          ],
        },
      ],
      'node/no-restricted-require': [
        'error',
        [
          {
            name: ['./**', '../**', '!../assets/example.png'],
            message:
              'Repo example should complete - it should not use files from your project, use ../assets/example.png if you need an example image',
          },
        ],
      ],
    },
  },
  /// the eslint config used for typescript
  eslintConfigForTypescript: {
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
      browser: true,
      es2021: true,
    },
    extends: 'plugin:react/recommended',
    overrides: [],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: '17.0.2',
      },
    },
    plugins: ['react', 'eslint-plugin-import'],
    rules: {
      'import/prefer-default-export': ['error'],
      'no-undef': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*', '!../assets/example.png'],
              message:
                'Repo example should complete - it should not use files from your project',
            },
            {
              group: ['!react', '!react-native', '!@rnmapbox/maps'],
              message: 'Should not use third-party libraries',
            },
          ],
        },
      ],
    },
  },
};

function log(...args) {
  console.log('=>', ...args);
}

async function ignoreIssue(issueNumber, ignoreLabels) {
  const token = core.getInput('repo-token') || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('No token found.');
  }
  const octokit = github.getOctokit(token);

  const { data: labels } = await octokit.rest.issues.listLabelsOnIssue({
    issue_number: issueNumber,
    ...github.context.repo,
  });
  const hasIgnoreLabel = labels.some((label) =>
    ignoreLabels.includes(label.name),
  );
  return hasIgnoreLabel;
}

async function run() {
  try {
    const issueNumber = getIssueNumber();
    if (await ignoreIssue(issueNumber, Config.ignoreLabels)) {
      return;
    }
    const [code, { isTypescript = false }] = getCode();
    if (!code) {
      await processGithubIssue(
        issueNumber,
        Config.noCodeExampleComment,
        false,
        true,
      );
      return;
    }
    const eslint = new ESLint({
      fix: false,
      useEslintrc: false,
      overrideConfig: isTypescript
        ? Config.eslintConfigForTypescript
        : Config.eslintConfig,
    });
    const results = await eslint.lintText(code, {
      filePath: isTypescript ? 'example.tsx' : 'example.jsx',
    });

    const hasErrors = results.some((result) => result.errorCount > 0);
    const formatter = await eslint.loadFormatter('codeframe');
    const message = formatter.format(results);
    if (process.env.LINT_FILE) {
      console.log('Lint result:', message);
      return;
    }
    await processGithubIssue(issueNumber, message, hasErrors, false);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getIssueNumber() {
  if (process.env.LINT_FILE) {
    return 'n/a';
  }
  const { issue } = github.context.payload;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  return issue.number;
}

function getCode() {
  if (process.env.LINT_FILE) {
    return [
      fs.readFileSync(process.env.LINT_FILE, 'utf8'),
      {
        isTypescript:
          process.env.LINT_FILE.endsWith('.ts') ||
          process.env.LINT_FILE.endsWith('.tsx'),
      },
    ];
  }
  const { issue } = github.context.payload;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  const { body } = issue;
  const start = body.search(/```(jsx?|tsx?|javascript|typescript)/i);
  if (start < 0) {
    return [null, { isTypescript: null }];
  }
  const end = body.indexOf('```', start + 1);
  const bodywithprefix = body.substring(start, end);

  const isTypescript = !!bodywithprefix.match(/```(tsx?|typescript)/i);

  return [
    bodywithprefix.replace(/^```(jsx?|tsx?|javascript|typescript)/i, ''),
    { isTypescript },
  ];
}

async function removeLabelIfExists(octokit, context, label, issueNumber) {
  log('removing label', label);
  try {
    await octokit.rest.issues.removeLabel({
      ...context,
      issue_number: issueNumber,
      name: label,
    });
  } catch (error) {
    if (error.status === 404) {
      return;
    }
    throw error;
  }
}

async function processGithubIssue(
  issueNumber,
  message,
  hasErrors,
  missingCode,
) {
  const token = core.getInput('repo-token') || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('No token found. Wanted to post message: ', message);
  }
  const octokit = github.getOctokit(token);

  const {
    commentMarker,
    label,
    commentPrelude,
    closeIssue,
    reopenIssue,
    closeLabel,
    noCodeExampleComment,
    closeIssueIfNoCodeExample,
  } = Config;

  const context = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  };
  await removeOldCommandFromPreviousRuns(
    octokit,
    context,
    commentMarker,
    issueNumber,
  );

  if (missingCode) {
    if (noCodeExampleComment) {
      await octokit.rest.issues.createComment({
        issue_number: issueNumber,
        body: commentMarker + '\n' + noCodeExampleComment,
        ...context,
      });
    }
    if (closeIssueIfNoCodeExample) {
      await octokit.rest.issues.update({
        issue_number: issueNumber,
        state: 'closed',
        ...context,
      });
      if (closeLabel) {
        await octokit.rest.issues.addLabels({
          issue_number: issueNumber,
          labels: [closeLabel],
          ...context,
        });
      }
    }
    return;
  }
  if (hasErrors) {
    await octokit.rest.issues.createComment({
      issue_number: issueNumber,
      body:
        commentMarker + '\n' + commentPrelude + '```eslint\n' + message + '```',
      ...context,
    });

    await octokit.rest.issues.addLabels({
      issue_number: issueNumber,
      labels: [label],
      ...context,
    });

    if (closeIssue) {
      await octokit.rest.issues.update({
        issue_number: issueNumber,
        state: 'closed',
        ...context,
      });
      if (closeLabel) {
        await octokit.rest.issues.addLabels({
          issue_number: issueNumber,
          labels: [closeLabel],
          ...context,
        });
      }
    }
  } else {
    removeLabelIfExists(octokit, context, label, issueNumber);
    if (reopenIssue) {
      await octokit.rest.issues.update({
        issue_number: issueNumber,
        state: 'open',
        ...context,
      });
      if (closeLabel) {
        removeLabelIfExists(octokit, context, closeLabel, issueNumber);
      }
    }
  }
}

async function removeOldCommandFromPreviousRuns(
  octokit,
  context,
  marker,
  issueNumber,
) {
  const { data: comments } = await octokit.rest.issues.listComments({
    issue_number: issueNumber,
    ...context,
  });
  const oldComment = comments.find(
    (comment) =>
      comment.user.login === Config.botLogin && comment.body.startsWith(marker),
  );
  if (oldComment) {
    log('=> removing old comment');
    await octokit.rest.issues.deleteComment({
      comment_id: oldComment.id,
      ...context,
    });
  }
}

run();
