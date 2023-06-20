const fs = require('fs');

const { Octokit } = require('@octokit/core');

async function fetchIssue(owner, repo, issueNumber) {
  const octokit = new Octokit();
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/issues/{issue_number}',
    {
      owner,
      repo,
      issue_number: issueNumber,
    },
  );
  return response.data;
}

async function run() {
  let issue = await fetchIssue('rnmapbox', 'maps', process.argv[2] || 2867);
  fs.writeFileSync('test-issue.json', JSON.stringify({ issue }, null, 2));
  console.log('issuse: ', issue);
}

run();
