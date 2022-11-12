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

async function run() {
  try {
    // `who-to-greet` input defined in action metadata file
    /*const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);*/

    // Octokit.js
    // https://github.com/octokit/core.js#readme

  const { repo, owner, token } = getInputs();
  console.log(owner);
  console.log(repo);
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