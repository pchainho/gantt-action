const fs = require("fs");
const core = require('@actions/core');
const github = require('@actions/github');
const plantumlEncoder = require('plantuml-encoder')
const axios = require('axios');
const { resolve } = require("path");
const { graphql } = require("@octokit/graphql");
const outputPlantumlFile = "gantt.puml"
const outputSvgFile = "gantt.svg"


function getInputs() {
//  const requiredOptions = { required: true };

//  const repository = core.getInput("repository", requiredOptions);
//  const milestone = core.getInput("milestone", requiredOptions);
const token = process.env.GITHUB_TOKEN;
//const myToken = process.env.MyToken;

  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

/*  console.log("token "+token)
  console.log("mytoken "+myToken)*/

  return {
    repo,
    owner,
    token
//    myToken
  };
}

function createGantt(milestones) {
  style = "<style>\n"+
  "ganttDiagram {\n"+
  "   task {\n"+
  "    BackGroundColor GreenYellow\n"+
  "    LineColor Green \n"+
  "    unstarted {\n"+
  "      BackGroundColor PaleVioletRed\n"+
  "      LineColor FireBrick\n"+
  "      FontColor Gold\n"+
  "    }\n"+
  "  }\n"+
  "}\n"+
  "</style>\n";

  gantt = "";
  projectStart = "2100-01-01";
  milestones.forEach(milestone => {
    completionStatus = Math.round(milestone.closed_issues/(milestone.open_issues+milestone.closed_issues)*100); 
    startDate = milestone.description.split(/\r?\n/)[0].split(" ")[1];
    endDate = milestone.due_on.split('T')[0];
    newTask = "["+milestone.title+"] starts "+startDate+" and ends "+endDate+" and is "+completionStatus+"% complete\n";
//    if (new Date() > new Date(endDate)) newTask = newTask +"["+milestone.title+"] is colored in red\n";
    gantt = gantt + newTask + "\n";
    if (new Date(startDate) < new Date(projectStart)) projectStart = startDate;

  });
  gantt = "@startgantt\n"+style+"saturday are closed\nsunday are closed\nprintscale weekly zoom 1\ntoday is colored in #Magenta\n"+
     "Project starts "+projectStart+"\n"+gantt + "@endgantt";
     console.log(gantt)
  return gantt;

}

async function getMilestones(repo, owner, token) {
  try {
    // Octokit.js
    // https://github.com/octokit/core.js#readme


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


async function getRepoWithGraphQL(repo, owner, token) {
  try {

console.log("getrepo "+token);
    graphqlWithAuth  = graphql.defaults({
  headers: {
    authorization: token
  },
});

const { repository } = await graphqlWithAuth (`
  {
    repository(owner: ${owner}, name: ${repo}) {
      issues(last: 3) {
        edges {
          node {
            title
          }
        }
      }
    }
  }
`);
return repository;
} catch (error) {
  core.setFailed(error.message);
}

}



const { repo, owner, token } = getInputs();


//getMilestones(repo, owner, token).then(getGantt).then(writeFiles).catch(console.error)


getRepoWithGraphQL(repo, owner, token).then(
  (repo) => console.log(repo)
)

  
//run()