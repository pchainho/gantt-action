const core = require('@actions/core');
const github = require('@actions/github');
const outputFile = "gantt.puml"

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

function createGantt(milestones) {
  const gantt = "@startgantt\n";
  milestones.forEach(milestone => {
    completionStatus = Math.round(milestone.closed_issues/(milestone.open_issues+milestone.closed_issues*100)); 
    newTask = "["+milestone.title+"] starts "+milestone.description.split(/\r?\n/)[0].split(" ")[1]+
    " and ends "+milestone.due_on.split('T')[0]+" and is "+completionStatus+" complete\n";
    gantt = gantt + newTask;
/*    console.log(milestone.title);
    console.log(milestone.description.split(/\r?\n/)[0].split(" ")[1]);
    console.log(milestone.due_on.split('T')[0]);
    console.log(milestone.closed_issues/(milestone.open_issues+milestone.closed_issues*100));*/

  });
  gantt = gantt + "@endgantt";
  console.log(gantt);
  return gantt;

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

    createGantt(data);
    core.setOutput('data', data);


  } catch (error) {
    core.setFailed(error.message);
  }
};

/*const writeGantt = (gantt) =>
new Promise((resolve, reject) => {
  fs.writeFile(outputFile, createGantt(), (err) =>
    err ? reject(err) : resolve(),
  )
})*/

//run().then(() =>writeGantt).catch(console.error)
run()