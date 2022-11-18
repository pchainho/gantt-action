const fs = require("fs");
const core = require('@actions/core');
const github = require('@actions/github');
const plantumlEncoder = require('plantuml-encoder')
const axios = require('axios');
const {Base64} = require('js-base64');
const { resolve } = require("path");
const outputPlantumlFile = "gantt.puml"
const outputSvgFile = "gantt.svg"


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
  gantt = "";
  projectStart = "2100-01-01";
  milestones.forEach(milestone => {
    completionStatus = Math.round(milestone.closed_issues/(milestone.open_issues+milestone.closed_issues)*100); 
    startDate = milestone.description.split(/\r?\n/)[0].split(" ")[1];
    newTask = "["+milestone.title+"] starts "+startDate+
    " and ends "+milestone.due_on.split('T')[0]+" and is "+completionStatus+"% complete\n";
    gantt = gantt + newTask;
    if (new Date(startDate) < new Date(projectStart)) projectStart = startDate;

  });
  gantt = "@startgantt\nProject starts "+projectStart+"\n"+gantt + "@endgantt";
  console.log(gantt);
  return gantt;

}

async function getMilestones() {
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
    const milestones = response.data;

//    core.setOutput('data', data);
    return milestones;


  } catch (error) {
    core.setFailed(error.message);
  }
};


const getGantt = (milestones) => 
new Promise((resolve, reject) => {
  const plantuml = createGantt(milestones)
 
  const encoded = plantumlEncoder.encode(plantuml);


      axios.get(`http://www.plantuml.com/plantuml/svg/${encoded}`).then(function (response) {
        const svg = response.data;
        resolve({plantuml, svg});

      })
      .catch(function (error) {
        reject(error);
      })

})


const writeFiles = ({plantuml, svg}) => {
  console.log(plantuml);
  console.log(svg);
const writePlantuml = new Promise((resolve, reject) => {
  fs.writeFile(outputPlantumlFile, plantuml, (err) =>
    err ? reject(err) : resolve())
});
const writeSvg = new Promise((resolve, reject) => {
  fs.writeFile(outputSvgFile, svg, (err) =>
    err ? reject(err) : resolve())
});

Promise.all([writePlantuml, writeSvg]).then(() => {
  console.log("Files Written");
  resolve();
});

}

getMilestones().then(getGantt).then(writeFiles).catch(console.error)
  
//run()