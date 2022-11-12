const core = require('@actions/core');
const github = require('@actions/github');

function getInputs() {
//  const requiredOptions = { required: true };

//  const repository = core.getInput("repository", requiredOptions);
//  const milestone = core.getInput("milestone", requiredOptions);
  const token = process.env.GITHUB_TOKEN;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  return {
    repo,
    owner,
    token
  };
}

function getInputs(milestones) {
  milestones.forEach(milestone => {
    console.log(milestone.title);
    console.log(milestone.description.starts);
    console.log(milestone.due_on);
    console.log(milestone.closed_issues/(milestone.open_issues+milestone.closed_issues*100));

  });

}

async function run() {
  try {
    // Octokit.js
    // https://github.com/octokit/core.js#readme

  const { repo, owner, token } = getInputs();

  const octokit = github.getOctokit(token);

    const response = await octokit.request(
      `GET /repos/{owner}/{repo}/milestones`,
      {
        owner: owner,
        repo: repo
      }
    );
    const data = response.data;

    console.log(data);
    core.setOutput('data', data);

  } catch (error) {
    core.setFailed(error.message);
  }
};

run();