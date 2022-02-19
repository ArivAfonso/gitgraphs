var express = require("express");
var router = express.Router();
const { graphql } = require("@octokit/graphql");
const { request } = require("@octokit/request")
var json_data = require('./Programming_Languages_Extensions.json')

function basicInfo(key, repo, owner){
    const { allPullRequests } = await graphql(
        `
        query{
            repository(name: $repo, owner: $owner) {
              pullRequests{totalCount}
            }
          }
        `,
        {
          owner: owner,
          repo: repo,
          headers: {
            authorization: key,
          },
        },
    );
    return allPullRequests
}

function getLanguages(key, repo, owner){
  const result = await request("GET /repos/{owner}/{repo}/languages", {
    headers: {
      authorization: key, // TODO: Implement proper Oauth
    },
    owner: owner,
    repo: repo,
  });

  var json = []
    for (var language in data){
    var kb = Math.round(data[language]/1024); // Convert bytes to kilobytes
    var color = json_data[language].color
    var d = {'data': language, 'value': kb, 'color': color}
    json.push(d)
  }
}