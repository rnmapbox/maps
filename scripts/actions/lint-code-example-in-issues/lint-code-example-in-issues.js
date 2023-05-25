// Runs eslint on the code example in the issue body and posts a comment with the lint results.

const core = require('@actions/core');
const github = require('@actions/github');
const { ESLint } = require('eslint');

async function run() {
  try {
    const issueNumber = getIssueNumber();
    const code = getCode();
    const eslint = new ESLint({ fix: false });
    const results = await eslint.lintText(code);
    const formatter = await eslint.loadFormatter('stylish');
    const message = formatter.format(results);
    await postComment(issueNumber, message);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getIssueNumber() {
  const { issue } = github.context.payload;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  return issue.number;
}

function getCode() {
  const { issue } = github.context.payload;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  const { body } = issue;
  const start = body.search(/```(jsx?|tsx?|javascript)/);
  if (start < 0) {
    throw new Error('Could not find code block in issue body');
  }
  const end = body.indexOf('```', start + 1);
  const bodywithprefix = body.substring(start, end);
  return bodywithprefix.replace(/^```(jsx?|tsx?|javascript)/, '');
}

async function postComment(issueNumber, message) {
  const token = core.getInput('repo-token') || process.env.GITHUB_TOKEN;
  if (! token) {
    console.error("No token found. Wanted to post message: ", message)
  }
  const octokit = github.getOctokit(token);

  const marker = '<!-- lint-action -->';
  const label = 'error-in-code';
  const prelude =
    '## Lint failed :sob:\n\nPlease fix the errors in your code example - [More info](https://github.com/rnmapbox/maps/wiki/ErrorInExamplesInIssue).:\n\n';

  const context = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  };
  await removeOldCommandFromPreviousRuns(octokit, context, marker, issueNumber);

  if (message.includes('error')) {
    await octokit.rest.issues.createComment({
      issue_number: issueNumber,
      body: marker + '\n' + prelude + '```eslint\n'+ message + '```',
      ...context,
    });

    await octokit.rest.issues.addLabels({
      issue_number: issueNumber,
      labels: [label],
      ...context,
    });
  } else {
    try {
      await octokit.rest.issues.removeLabel({
        issue_number: issueNumber,
        name: label,
        ...context,
      });
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }
  }
}

async function removeOldCommandFromPreviousRuns(octokit, context, marker, issueNumber) {
  const { data: comments } = await octokit.rest.issues.listComments({
    issue_number: issueNumber,
    ...context,
  });
  const oldComment = comments.find(
    (comment) =>
      comment.user.login === 'github-actions[bot]' &&
      comment.body.startsWith(marker),
  );
  if (oldComment) {
    console.log('=> removing old comment');
    await octokit.rest.issues.deleteComment({
      comment_id: oldComment.id,
      ...context,
    });
  }
}

run();
